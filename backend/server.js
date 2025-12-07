const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { client, dbName, connectToMongo } = require('./connection/connection');
const setupMiddleware = require('./middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.BASE_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));


// Middlewares
setupMiddleware(app);

// health check
app.get('/health', (req, res) => res.type('text').send('ok'));

// Routes
const indexRoute = require('./routes/index');
const usersRoute = require('./routes/users');
const passwordRoute = require('./routes/password');
const apiRoute = require('./routes/api');
const productsRoute = require('./routes/products');
const ordersRoute = require("./routes/orders");
const adminOrdersRoute = require("./routes/adminOrders");
const adminReportsRoute = require("./routes/adminReports");
app.use('/', indexRoute);
app.use('/users', usersRoute);
app.use('/password', passwordRoute);
app.use('/api', apiRoute);
app.use('/products', productsRoute);
app.use("/orders", ordersRoute);
app.use("/admin", adminOrdersRoute);
app.use("/admin", adminReportsRoute);
app.use((req, res, next) => {
    //404 logger
if (!res.headersSent) {
        console.warn('404:', req.method, req.originalUrl, 'referrer:',
        req.get('referer') || '-')
    }
    next()
})
// 404
app.use((req, res, next) => {
    res.status(404).render('404', { 
        title: "Page Not Found",
        currentPage: '404'
    });
});
// 500 handler (last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (res.headersSent) return next(err);
    res.status(500).render('500', { title: 'Server Error', req: req });
});

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