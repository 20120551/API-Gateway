const express = require('express');
const AuthMiddleware = require('./middleware');
const axios = require('axios');
const Post = require('./../model/post-mode');

const router = express.Router();
const authMiddleware = new AuthMiddleware();

router
    .route('/postApi/post')
    .get(async(req, res)=>{
        try {
            console.log('--------------start GET POSTS---------------')
            const posts = await Post.find({});
            if(posts.length === 0) return res.status(200).json({
                status: 200,
                message: 'not have post yet',
                data: null
            })

            res.status(200).json({
                status: 200,
                message: 'get all posts successfully',
                data: {
                    posts
                },
                length: posts.length
            })
            console.log('--------------end GET POSTS---------------')
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    })
    .post(authMiddleware.checkUser, async(req, res)=>{
        try {
            console.log('--------------start CREATE POST---------------')
            const {title, background} = req.body;
            const user = req.user;

            const post = new Post({
                title,
                background,
                author: user
            })

            const _post = await post.save();

            //PUBLISH TO [AUTH SERVER]
            const url = process.env.COMMUNICATE || 'localhost'
            await axios.post(`http://${url}:3000/authApi/event`, {
                user: user,
                post: _post,
                event: 'CREATE_POST'
            })

            res.status(200).json({
                status: 200,
                message: 'add new post successfully',
                data: {
                    post: _post
                }
            })
            console.log('--------------end CREATE POST---------------')
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    })

router
    .route('/postApi/post/:id')
    .get(async(req, res)=>{
        try {
            const {id} = req.params;
            const post = await Post.findOne({_id: id});

            //check if post doest not exist
            if(!post) res.status(200).json({
                status: 200,
                message: 'post does not exist',
                data: null
            })

            res.status(200).json({
                status: 200,
                message: 'get post successfully',
                data: {
                    post
                }
            })
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    })
    .post(authMiddleware.checkUser, async(req, res)=>{
        try {
            const {id} = req.params;
            const user = req.user;
            await Post.updateOne({_id: id}, {
                $push: {
                    like: {
                        user
                    }
                }
            });

            //PUBLISH TO [AUTH SERVER]
            const url = process.env.COMMUNICATE || 'localhost'
            await axios.post(`http://${url}:3000/authApi/event`, {
                user: user,
                event: 'LIKE_POST'
            })

            res.status(200).json({
                status: 200,
                message: 'like post successfully',
            })
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    })
    .patch(authMiddleware.checkAuthorOfPost, async(req, res)=>{
        try {
            const {id} = req.params;
            const {title, background} = req.body;

            const user = req.user;

            await Post.updateOne({_id: id}, {
                $set: {
                    title: title,
                    background: background
                }
            });

            //PUBLISH TO [AUTH SERVER]
            const url = process.env.COMMUNICATE || 'localhost'
            await axios.post(`http://${url}:3000/authApi/event`, {
                user: user,
                post:{
                    _id: id,
                    background,
                    title
                },
                event: 'UPDATE_POST'
            })

            res.status(200).json({
                status: 500,
                message: 'update post successfully'
            })
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    })
    .delete(authMiddleware.checkAuthorOfPost, async(req, res)=>{
        try {
            const {id} = req.params;
            const user = req.user;

            await Post.deleteOne({_id: id});

            //PUBLISH TO [AUTH SERVER]
            const url = process.env.COMMUNICATE || 'localhost'
            await axios.post(`http://${url}:3000/authApi/event`, {
                user: user,
                post: {
                    _id: id
                },
                event: 'DELETE_POST'
            })

            res.status(200).json({
                status: 500,
                message: 'delete post successfully'
            })
        } catch(err) {
            res.status(500).json({
                status: 500,
                message: 'server was interval'
            })
        }
    })
    
module.exports = router;