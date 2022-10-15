const express = require('express');
const bcrypt = require('bcrypt');
const Auth = require('./../model/auth-model');

const router = express.Router();
router.post('/authApi/signup', async(req, res)=>{
    try {
        console.log('------------START sign up---------------')
        const {username, password} = req.body;
    
        const user = await Auth.findOne({username: username});

        //check if user exists
        if(user) return res.status(401).json({
            status: 401,
            message: 'user has existed',
        })

        const salt = await bcrypt.genSalt(10);
        const _password = await bcrypt.hash(password, salt);


        const auth = new Auth({
            username, 
            password: _password
        })

        const _auth = await auth.save();

        res.status(200).json({
            status: 200,
            message: 'success when creating new account',
            data: _auth
        })
        console.log('------------END sign up---------------')
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'server was interval',
        })
    }
})

router.post('/authApi/login', async(req, res)=>{
    try {
        console.log('------------START login---------------')
        const {username, password} = req.body;
        
        const user = await Auth.findOne({username: username});

        //check if user does not exist
        if(!user) return res.status(401).json({
            status: 401,
            message: 'username does not exist',
        })

        const isMatch = await bcrypt.compare(password, user.password);

        //check if password is correct
        if(!isMatch) return res.status(401).json({
            status: 401,
            message: 'password does not match'
        })
        
        //set user to session
        req.session.user = user;

        res.status(200).json({
            status: 200,
            message: 'login successfully',
            data: {
                user,
                session: user
            }
        })
        console.log('------------END login---------------')
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'server was interval',
        })
    }
})

router.post('/authApi/logout', async(req, res)=>{
    try {
        console.log('------------START logout---------------')
        req.session.destroy();
        res.status(200).json({
            status: 200,
            data: {
                user: req.user
            }
        })
        console.log('------------END logout---------------')
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'server was interval',
        })
    }
})

router.post('/authApi/event', async(req, res)=>{
    try {
        console.log('------------START event---------------')
        const {post, user, event} = req.body;
        const _user = await Auth.findOne({_id: user._id});
        //check if user does not exist
        if(!_user) return res.status(400).json({
            status: 400,
            message: 'user was not found'
        })

        
        const {title, background, like, _id} = post;
        switch(event) {
            case 'CREATE_POST':
                _user.post.push({
                    title,
                    background,
                    like: like.length,
                    _id
                });
                break;
            case 'UPDATE_POST':
                for(const _post of _user.post){
                    if(_post._id === _id) {
                        _post.title = title;
                        break;
                    }
                }
                break;
            case 'DELETE_POST':
                const index = _user.post.findIndex(_post=>_post._id === post._id);
                if(index === -1) return res.status(200).json({
                    status: 200,
                    message: 'this post was not found'
                })
                _user.post.splice(index, 1);
                break;
            case 'LIKE_POST': 
                for(const _post of _user.post){
                    if(_post._id === post._id) {
                        _post.like++;
                        break;
                    }
                }
                break;
            default:
                return res.status(200).json({
                    status: 200,
                    message: 'we have not yet implement this event'
                })
        }
        await _user.save();
        res.status(200).json({
            status: 200,
            message: `handle ${event} successfully`
        })
        console.log('------------END event---------------')
    } catch(err) {
        res.status(500).json({
            status: 500,
            message: 'server was interval',
        })
    }
})

module.exports = router;