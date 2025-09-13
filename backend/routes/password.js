const express = require('express');
const router = express.Router();
const PasswordService = require('../services/password.services');
const PasswordController = require('../controllers/password.controller');

// Create controller with app.locals when router is used
router.use((req, res, next) => {
    if (!req.passwordController) {
        const passwordService = new PasswordService(req.app.locals.client, req.app.locals.dbName);
        req.passwordController = new PasswordController(passwordService);
    }
    next();
});

// Forgot password routes
router.get('/forgot', (req, res) => req.passwordController.showForgotPasswordForm(req, res));
router.post('/forgot', (req, res) => req.passwordController.sendResetEmail(req, res));

// Reset password routes  
router.get('/reset/:token', (req, res) => req.passwordController.showResetPasswordForm(req, res));
router.post('/reset/:token', (req, res) => req.passwordController.resetPassword(req, res));

module.exports = router;