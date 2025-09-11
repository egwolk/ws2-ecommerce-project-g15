const { MongoClient } = require('mongodb');
require('dotenv').config();

// MongoDB Setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "ecommerceDB";

async function connectToMongo() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");
        return client;
    } catch (err) {
        console.error("MongoDB connection failed", err);
        throw err;
    }
}

module.exports = {
    client,
    dbName,
    connectToMongo
};