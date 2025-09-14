const express = require('express');
const path = require('path');

function setupStaticFiles(app) {
    app.use('/styles', express.static(path.join(__dirname, '../../frontend/styles')));
    app.use('/scripts', express.static(path.join(__dirname, '../../frontend/scripts')));
    
    app.use('/assets', express.static(path.join(__dirname, '../../frontend/assets')));
}

module.exports = setupStaticFiles;