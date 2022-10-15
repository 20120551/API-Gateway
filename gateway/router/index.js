const axios = require('axios');
const express = require('express');
const register = require('./service.json');
const LoadBalancer = require('./../utils/loadbalancer');
const {writeFile, isExistInstance} = require('../utils/fileHandler');

const router = express.Router();
// [REGISTER], [UNREGISTER], [LOAD BALANCER], [ENABLE, DISABLE]
router.post('/register', (req, res)=>{
    try {
        const {apiName, host, port, url, protocol} = req.body;
        if(!register.services[apiName]) {
            register.services[apiName] = {
                index: 0,
                loadBalancer: 'ROUND_ROBIN',
                instances: [{
                    apiName,
                    host,
                    port: parseInt(port),
                    url,
                    protocol,
                    isEnable: true
                }]
            }
        } else {
            if(isExistInstance(register.services[apiName], req.body))
                return res.status(200).json({
                    status: 200,
                    message: 'instance has existed on service'
                })

            register.services[apiName].instances.push({
                apiName,
                host,
                port,
                url,
                isEnable: true
            })
        }

        writeFile('./router/service.json', register);
        res.status(200).json({
            status: 200,
            message: 'instance has declared on your service'
        })
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'fail to access this resource'
        })
    }
})

router.post('/unregister', async(req, res)=>{
    try {
        const {apiName, url} = req.body;
        if(!register.services[apiName] || !isExistInstance(register.services[apiName], req.body)) {
            return res.status(200).json({
                status: 200,
                message: `not found this ${apiName} was running on ${url} domain on our service`
            })
        }
        
        //find index of this instance on our apiName service
        const index = register.services[apiName].instances.findIndex((instance)=>instance.url === url);
        //delete this instance
        register.services[apiName].instances.splice(index, 1);
        writeFile('./router/service.json', register);
        res.status(200).json({
            status: 200,
            message: 'instance has deleted on your service'
        })
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'fail to access this resource'
        })
    }
})

router.post('/enable/:api', (req, res)=>{
    try {
        const {api} = req.params;
        const {isEnable, url} = req.body;
        const service = register.services[api];
        if(!service) {
            return res.status(200).json({
                status: 200,
                message: `not found this ${api} service on our services`
            })
        }

        const index = service.instances.findIndex((instance)=>instance.url === url);
        if(index === -1) {
            return res.status(200).json({
                status: 200,
                message: `not found this ${url} instance on our instances`
            })
        }

        service.instances[index]["isEnable"] = isEnable;

        writeFile('./router/service.json', register);
        res.status(200).json({
            status: 200,
            message: `this ${api} was running on ${url} domain service has been enabled` 
        })
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'fail to access this resource'
        })
    }
})

router.all('/:apiName/*', async(req, res)=>{
    try {
        const {apiName} = req.params;
        const service = register.services[apiName];
        const loadBalancer = new LoadBalancer(service);
        const index = loadBalancer[service.loadBalancer]();

        const instance = service.instances[index];

        console.log(instance.url + req.url)
        console.log(req.method)
        const response = await axios({
            method: req.method,
            headers: {
                session: JSON.stringify(req.cookies.session)
            },
            url: instance.url + req.url,
            data: req.body
        })
        //login api has been call
        if( response.data.data &&  response.data.data.session) {
            res.cookie('session', response.data.data.session, {
                maxAge: 1200000,
                httpOnly: true,
                secure: false
            })
        }
        
        //rewrite service.json file
        service.index = index;
        writeFile('./router/service.json', register);
        
        res.status(200).json({
            ...response.data
        })
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'fail to access this resource'
        })
    }
})

module.exports = router;