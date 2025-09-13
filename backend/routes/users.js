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



/*

// Show all registered users
router.get('/list', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        const users = await usersCollection.find().toArray();
        res.render('users-list', { title: "Registered Users", users: users });
    } catch (err) {
        console.error("Error fetching users:", err);
        res.send("Something went wrong.");
    }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        
        const user = await usersCollection.findOne({ _id: new
        ObjectId(req.params.id) });
        if (!user) {
        return res.send("User not found.");
        }
        res.render('edit-user', { title: "Edit User", user: user });
    } catch (err) {
        console.error("Error loading user:", err);
        res.send("Something went wrong.");
    }
});

// Handle update form
router.post('/edit/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        await usersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { name: req.body.name, email: req.body.email } }
        );
        res.redirect('/users/list');
    } catch (err) {
        console.error("Error updating user:", err);
        res.send("Something went wrong.");
    }
});

// Delete user
router.post('/delete/:id', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        
        await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.redirect('/users/list');
    } catch (err) {
        console.error("Error deleting user:", err);
        res.send("Something went wrong.");
    }
});
*/


module.exports = router;