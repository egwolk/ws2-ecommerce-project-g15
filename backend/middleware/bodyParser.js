const bodyParser = require('body-parser');

function setupBodyParser(app) {
    app.use(bodyParser.urlencoded({ extended: true }));
}

module.exports = setupBodyParser;