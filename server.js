const express = require("express");
const {MongoClient} = require("mongodb");
const cors = require('cors');

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URL);
const server = express();

async function initializeDatabase(){
    await client.connect();
    console.log("Connected to Database");
}

async function initiaizeServer(){
    server.listen(port,()=>{
        console.log("Connected to Server");
    })
    server.use(cors());
    server.use(express.json());
    server.use("/",require("./expressCode/userlogin.js"));
}

async function init(){
    await initializeDatabase();
    await initiaizeServer();
}

init();

module.exports = client;