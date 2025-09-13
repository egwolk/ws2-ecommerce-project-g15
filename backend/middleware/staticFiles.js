const express = require('express');
const path = require('path');

function setupStaticFiles(app) {
    // Serve frontend scripts
    app.use('/scripts', express.static(path.join(__dirname, '../../frontend/scripts')));
    
    // Serve other static assets if needed
    app.use('/assets', express.static(path.join(__dirname, '../../frontend/assets')));
}

module.exports = setupStaticFiles;