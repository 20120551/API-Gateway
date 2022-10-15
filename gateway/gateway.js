const express = require('express');
const cookieParser = require('cookie-parser')
const router = require('./router');

const app = express();

// to get data on req.body
app.use(express.json({limit: "16mb"}));
app.use(express.urlencoded({ limit: "16mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());
app.use(router);

const PORT = 3000
app.listen(PORT, ()=>{
    console.log('server is running on port', PORT);
}).on('error', (err)=>{
    console.log('server was out of the box with', err);
})