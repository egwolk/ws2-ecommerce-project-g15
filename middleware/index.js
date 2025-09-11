const bodyParser = require('body-parser');
const session = require('express-session');
const express = require('express');

function setupMiddleware(app) {
    // Body parser
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // Session setup
    app.use(session({
        secret: process.env.SESSION_SECRET || 'dev-secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false, // set to true only if using HTTPS
            maxAge: 30 * 60 * 1000 // 30 minutes (in milliseconds)
        }
    }));
    
    // Session expiration check
    app.use((req, res, next) => {
        if (req.session.user) {
            const now = new Date();
            const expires = new Date(req.session.cookie._expires);
            if (now >= expires) {
                req.session.destroy();
                return res.redirect('/users/login?message=expired');
            }
        }
        next();
    });
    
    // View engine
    app.set('view engine', 'ejs');
    
    // Static files
    app.use('/client.scripts', express.static('client.scripts'));
}

module.exports = setupMiddleware;