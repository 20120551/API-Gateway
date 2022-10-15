const express = require('express');
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const router = require('./router');
const app = express();

app.use(express.json({limit: "16mb"}));
app.use(express.urlencoded({ limit: "16mb", extended: true, parameterLimit: 50000 }));

const mongoUrl = process.env.MG_USERNAME === undefined ? process.env.MONGO_URL : `mongodb://${process.env.MG_USERNAME}:${process.env.MG_PASSWORD}@mongo:27017/`;
console.log(mongoUrl)
mongoose.connect(mongoUrl)
    .then(()=>{
        console.log('mongo connecting succeed');
    })
    .catch((err)=>{
        console.log('mongo connection fails on', err);
    })

const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST;
const API_NAME = process.env.API_NAME;
const PROTOCOL = process.env.PROTOCOL;
const URL = `${PROTOCOL}://${HOST}:${PORT}`;

app.use(router);
app.listen(PORT, async()=>{
    //REGISTER TO API GATEWAY
    const gateway = process.env.GATEWAY || 'localhost'
    const response = await axios({
        method: 'post',
        url: `http://${gateway}:3000/register`,
        headers: {'Content-Type': 'application/json'},
        data:{
            protocol: PROTOCOL,
            host: HOST,
            port: parseInt(PORT),
            url: URL,
            apiName: API_NAME
        }
    })

    console.log('message: ', response.data.message);
    console.log('server is running on port', PORT);
}).on('error', ()=>{
    console.log('server was out of the box with', err);
})