const bodyParser = require('body-parser');

function setupBodyParser(app) {
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
}

module.exports = setupBodyParser;