const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const partials = require('express-partials');

function setupViewEngine(app) {
    // Set up EJS partials
    app.use(partials());

    // Set up EJS layouts
    app.use(expressLayouts);
    app.set('layout', '../layouts/default'); // Looks for views/layouts/default.ejs
    app.set('layout extractScripts', true);
    app.set('layout extractStyles', true);
    
    // Set up EJS view engine
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../../frontend/views'));
}

module.exports = setupViewEngine;