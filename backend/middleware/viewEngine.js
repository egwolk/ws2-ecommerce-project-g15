const path = require('path');

function setupViewEngine(app) {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../../frontend/views'));
    
    // Set path for components
    app.set('components', path.join(__dirname, '../../frontend/components'));
}

module.exports = setupViewEngine;