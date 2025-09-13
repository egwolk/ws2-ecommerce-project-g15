const express = require('express');

function setupStaticFiles(app) {
    app.use('/client.scripts', express.static('client.scripts'));
}

module.exports = setupStaticFiles;