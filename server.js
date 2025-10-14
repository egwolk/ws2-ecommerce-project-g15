const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const verifyTurnstile = require('./utils/turnstileVerify');
/*
app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
});
*/

// Security and performance middleware
app.set('trust proxy', 1); // if behind Render proxy
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "https://challenges.cloudflare.com"
            ],
            frameSrc: [
                "'self'",
                "https://challenges.cloudflare.com"
            ],
            connectSrc: [
                "'self'",
                "https://challenges.cloudflare.com"
            ]
        }
    }
})); // sensible security headers
app.use(compression()); // smaller responses

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true only if using HTTPS
        maxAge: 1 * 60 * 1000 // 15 minutes (in milliseconds)
    }
}));
app.use((req, res, next) => {
    res.locals.user = req.session?.user || null
    next()
})
app.use((req, res, next) => {
    if (req.session.user && req.session.cookie.expires < new Date()) {
        req.session.destroy();
        return res.redirect('/users/login?message=expired');
    }
    next();
});
app.set('view engine', 'ejs');


// Routes
const indexRoute = require('./routes/index');
const usersRoute = require('./routes/users');
const passwordRoute = require('./routes/password');
app.use('/', indexRoute);
app.use('/users', usersRoute);
app.use('/password', passwordRoute);
app.use((req, res, next) => {
    if (!res.headersSent) {
        console.warn('404:', req.method, req.originalUrl, 'referrer:',
        req.get('referer') || '-')
    }
    next()
})
// 404 handler (must be the last route)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'Not Found', path: req.path })
    }
    res.set('Cache-Control', 'no-store')
    res.status(404).render('404', { title: 'Page Not Found' })
})
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).render('500', { title: 'Server Error', req: req })
})
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (res.headersSent) return next(err);
    res.status(500).render('500', { title: 'Server Error', req: req });
});

// MongoDB Setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Expose client & dbName to routes
app.locals.client = client;
app.locals.dbName = process.env.DB_NAME || "ecommerceDB";


async function main() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas");
        /*
        // Select database
        const database = client.db("ecommerceDB");
        // Temporary test route
        app.get('/', (req, res) => {
        res.send("Hello, MongoDB is connected!");
        });
        */
        // Start server
        app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("MongoDB connection failed", err);
    }
}
main();