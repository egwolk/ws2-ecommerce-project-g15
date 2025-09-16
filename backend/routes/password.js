const express = require('express');
const router = express.Router();
const UserService = require('../services/users.services');
const UserController = require('../controllers/users.controller');

// Create controller with app.locals when router is used
router.use((req, res, next) => {
    if (!req.userController) {
        const userService = new UserService(req.app.locals.client, req.app.locals.dbName);
        req.userController = new UserController(userService);
    }
    next();
});

// Forgot password routes
router.get('/forgot', (req, res) => req.userController.showForgotPasswordForm(req, res));
router.post('/forgot', (req, res) => req.userController.sendResetEmail(req, res));

// Reset password routes  
router.get('/reset/:token', (req, res) => req.userController.showResetPasswordForm(req, res));
router.post('/reset/:token', (req, res) => req.userController.resetPassword(req, res));

module.exports = router;