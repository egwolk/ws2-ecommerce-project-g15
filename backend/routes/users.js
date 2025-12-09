const express = require('express');
const router = express.Router();
const UserService = require('../services/users.services');
const UserController = require('../controllers/users.controller');
const { requireAdmin, requireLogin, requireCustomer } = require('../middleware/auth');
const { requireTurnstile } = require('../middleware/turnstile');


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
router.post('/register', requireTurnstile, (req, res) => req.userController.registerUser(req, res));

// Verification route
router.get('/verify/:token', (req, res) => req.userController.verifyEmail(req, res));

// Login routes
router.get('/login', (req, res) => req.userController.showLoginForm(req, res));
router.post('/login', requireTurnstile, (req, res) => req.userController.loginUser(req, res));

// Dashboard routes
router.get('/dashboard', requireLogin, (req, res) => req.userController.showDashboard(req, res));
// Profile routes (show edit form and update profile)
router.get('/profile', requireLogin, (req, res) => req.userController.showEditProfileForm(req, res));
router.post('/profile', requireLogin, (req, res) => req.userController.updateUserProfile(req, res));
// Orders list for logged-in user
router.get('/orders', requireLogin, (req, res) => req.userController.showOrders(req, res));
// Cart routes - only for verified customers (not admins)
router.get('/cart', requireCustomer, (req, res) => req.userController.showCart(req, res));
router.post('/cart/remove', requireCustomer, (req, res) => req.userController.removeFromCart(req, res));
router.post('/cart/add', requireCustomer, (req, res) => req.userController.addToCart(req, res));
router.post('/cart/remove-product', requireCustomer, (req, res) => req.userController.removeFromCartOnProduct(req, res));
// Checkout routes
router.get('/checkout', requireCustomer, (req, res) => req.userController.showCheckout(req, res));
router.post('/process-payment', requireCustomer, (req, res) => req.userController.processPayment(req, res));
router.get('/payment-success', requireCustomer, (req, res) => req.userController.showPaymentSuccess(req, res));
router.get('/admin', requireAdmin, (req, res) => req.userController.showAdminDashboard(req, res));

// Logout route
router.get('/logout', (req, res) => req.userController.logoutUser(req, res));

// Delete user route (admin only)
router.post('/delete/:id', requireAdmin, async (req, res) => req.userController.deleteUser(req, res));

// Edit form route (admin only)
router.get('/edit/:id', requireAdmin, async (req, res) => req.userController.showEditForm(req, res));
router.post('/edit/:id', requireAdmin, async (req, res) => req.userController.updateUser(req, res));

// (legacy) edit-profile routes removed; use /users/profile instead

// Create user routes (admin only)
router.get('/admin/create', requireAdmin, (req, res) => req.userController.showAdminCreateForm(req, res));
router.post('/admin/create', requireAdmin, (req, res) => req.userController.createUserByAdmin(req, res));

module.exports = router;