const express = require('express');
const router = express.Router();
const UserService = require('../services/users.services');
const UserController = require('../controllers/users.controller');

// Create controller with app.locals when router is used
router.use((req, res, next) => {
    const userService = new UserService(req.app.locals.client, req.app.locals.dbName);
    const userController = new UserController(userService);
    
    // Attach controller to request for route handlers to access
    req.userController = userController;
    next();
});

// Registration routes
router.get('/register', (req, res) => req.userController.showRegisterForm(req, res));
router.post('/register', (req, res) => req.userController.registerUser(req, res));

// Verification route
router.get('/verify/:token', (req, res) => req.userController.verifyEmail(req, res));

// Login routes
router.get('/login', (req, res) => req.userController.showLoginForm(req, res));
router.post('/login', (req, res) => req.userController.loginUser(req, res));

// Dashboard routes
router.get('/dashboard', (req, res) => req.userController.showDashboard(req, res));
router.get('/admin', (req, res) => req.userController.showAdminDashboard(req, res));

// Logout route
router.get('/logout', (req, res) => req.userController.logoutUser(req, res));

// Delete user route
router.post('/delete/:id', async (req, res) => req.userController.deleteUser(req, res));

// Edit form route
router.get('/edit/:id', async (req, res) => req.userController.showEditForm(req, res));
router.post('/edit/:id', async (req, res) => req.userController.updateUser(req, res));

// Edit profile routes
router.get('/edit-profile/:id', async (req, res) => req.userController.showEditProfileForm(req, res));
router.post('/edit-profile/:id', async (req, res) => req.userController.updateUserProfile(req, res));

// Create user routes (admin only)
router.get('/admin/create', (req, res) => req.userController.showAdminCreateForm(req, res));
router.post('/admin/create', (req, res) => req.userController.createUserByAdmin(req, res));

module.exports = router;