const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { client, dbName, connectToMongo } = require('./connection/connection');
const setupMiddleware = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.BASE_URL,
    credentials: true
}));


// Middlewares
setupMiddleware(app);

// Routes
const indexRoute = require('./routes/index');
const usersRoute = require('./routes/users');
const passwordRoute = require('./routes/password');
const apiRoute = require('./routes/api');
const productsRoute = require('./routes/products');
app.use('/', indexRoute);
app.use('/users', usersRoute);
app.use('/password', passwordRoute);
app.use('/api', apiRoute);
app.use('/products', productsRoute);



// Expose client & dbName to routes
app.locals.client = client;
app.locals.dbName = dbName;


async function main() {
    try {
        await connectToMongo();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
    }
}
main();