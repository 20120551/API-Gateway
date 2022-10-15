const mongoose = require('mongoose');

const {Schema, model} = mongoose;

const Post = new Schema({
    title: {
        type: String,
        default: ''
    },
    background: {
        type: String, 
        default: ''
    },
    author: {
        _id: {
            type: String,
            require: true
        },
        username: {
            type: String,
        }
    },
    like: [{
        _id: {
            type: String,
            require: true
        },
        username: {
            type: String,
        }
    }]
})

module.exports = model('post', Post);