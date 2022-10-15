const mongoose = require('mongoose');

const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

const {Schema, model} = mongoose; 
const Auth = new Schema({
    username: {
        type: String, 
        require: true, 
        unique: true,
        validate: {
            validator: validateEmail,
            msg: 'this field require is email'
        }
    },
    password: {
        type: String, 
        require: true, 
    },
    post: [{
        _id: {
            type: String, 
            require: true
        },
        title: {
            type: String,
        },
        background: {
            type: String,
        },
        like: {
            type: Number
        }
    }]
})

module.exports = model('auth', Auth);