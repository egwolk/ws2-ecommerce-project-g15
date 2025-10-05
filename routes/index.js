const express = require('express');
const router = express.Router();

// Home route
router.get('/', (req, res) => {
    res.render('index', { title: "Home Page", message: "Hello, MongoDB is connected!" });
});
router.get('/crash', (req, res) => {
    throw new Error('Test crash');
});

router.get('/crash-async', async (req, res, next) => {
try {
throw new Error('Async crash');
} catch (err) {
next(err);
}
});
module.exports = router;