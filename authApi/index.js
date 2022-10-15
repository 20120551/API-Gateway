const express = require('express');
const session = require("express-session");
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const axios = require('axios');
let RedisStore = require("connect-redis")(session);
const { createClient } = require("redis");

const router = require('./router');
const app = express();

const redisUrl = process.env.RD_SECRET === undefined ? '' : `redis://redis:6379`;
let redisClient = createClient({ 
    legacyMode: true,
    url: redisUrl
})
redisClient.connect()
    .then(()=>{
        console.log('redis connecting succeed');
    })
    .catch((err)=>{
        console.log('redis connection fails on', err);
    })
    
// run this url with docker-compose

const mongoUrl = process.env.MG_USERNAME === undefined ? process.env.MONGO_URL : `mongodb://${process.env.MG_USERNAME}:${process.env.MG_PASSWORD}@mongo:27017`;

mongoose.connect(mongoUrl)
    .then(()=>{
        console.log('mongo connecting succeed');
    })
    .catch((err)=>{
        console.log('mongo connection fails on', err);
    })

app.use(cors());
app.use(express.json({limit: "16mb"}));
app.use(express.urlencoded({ limit: "16mb", extended: true, parameterLimit: 50000 }));
app.use(
    session({
        store: new RedisStore({ client: redisClient }),
        saveUninitialized: false,
        secret: "secret key",
        resave: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 1200000
        },
    })
)
app.use(router);

const PORT = process.env.PORT || PORT;
const HOST = process.env.HOST;
const API_NAME = process.env.API_NAME;
const PROTOCOL = process.env.PROTOCOL;
const URL = `${PROTOCOL}://${HOST}:${PORT}`;

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