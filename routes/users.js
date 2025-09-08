const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 12;
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);



// Show registration form
router.get('/register', (req, res) => {
    res.render('register', { title: "Register" });
});


// Registration (POST)
router.post('/register', async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const usersCollection = db.collection('users');

        // 1. Check if email already exists
        const existingUser = await usersCollection.findOne({ email:
        req.body.email });
        if (existingUser) return res.send("User already exists with this email.");

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const currentDate = new Date();

        // 3. Create verification token
        const token = uuidv4();
        // Base URL: local (http://localhost:3000) or deployed (https://ws2-ecommerce-project-g15.onrender.com)
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const verificationUrl = `${baseUrl}/users/verify/${token}`;


        // 4. Build new user object
        const newUser = {
            userId: uuidv4(), // unique ID for the user
            firstName: req.body.firstName, // from form input
            lastName: req.body.lastName,
            email: req.body.email,
            passwordHash: hashedPassword, // never store plain text password
            role: 'customer', // default role
            accountStatus: 'active',
            isEmailVerified: false, // must be verified before login
            verificationToken: token, // link user to verification
            tokenExpiry: new Date(Date.now() + 3600000), // expires in 1 hour
            createdAt: currentDate,
            updatedAt: currentDate
        };
        // 5. Insert into database
        await usersCollection.insertOne(newUser);
        
        try {
            const emailResponse = await resend.emails.send({
                from: process.env.RESEND_FROM_EMAIL,
                to: newUser.email,
                subject: 'Verify your account',
                html: `
                    <h2>Welcome, ${newUser.firstName}!</h2>
                    <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                `
            });
            console.log("Email sent response:", emailResponse);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Continue with the response even if email fails
        }

        res.send(`
            <h2>Registration Successful!</h2>

            <!-- <p>User ${newUser.firstName} ${newUser.lastName} registered with ID:
            ${newUser.userId}</p>
            <a href="/users/login">Proceed to Login</a> 

            <p>Please verify your account before logging in.</p>
            <p><a href="/users/verify/${token}">Click here to verify</a></p> -->

            <p>A verification link has been sent to your email address.</p>
            <p>Please check your inbox and verify your account before logging in.</p>
        `);
    } catch (err) {
        console.error("Error saving user:", err);
        res.send("Something went wrong.");
    }
});

// Email Verification Route
router.get('/verify/:token', async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const usersCollection = db.collection('users');

        // 1. Find user by token
        const user = await usersCollection.findOne({ verificationToken: req.params.token });

        // 2. Check if token exists
        if (!user) {
            return res.send("Invalid or expired verification link.");
        }
        // 3. Check if token is still valid
        if (user.tokenExpiry < new Date()) {
            return res.send("Verification link has expired. Please register again.");
        }

        // 4. Update user as verified
        await usersCollection.updateOne(
            { verificationToken: req.params.token },
            { $set: { isEmailVerified: true }, $unset: { verificationToken: "", tokenExpiry:
            
            "" } }
        );
        res.send(`
            <h2>Email Verified!</h2>
            <p>Your account has been verified successfully.</p>
            <a href="/users/login">Proceed to Login</a>
        `);
    } catch (err) {
        console.error("Error verifying user:", err);
        res.send("Something went wrong during verification.");
    }
});

// Show login form
router.get('/login', (req, res) => {
let message = null;
    
    if (req.query.message === 'logout') {
        message = 'You have been logged out.';
    } else if (req.query.message === 'expired') {
        message = 'Your session has expired. Please log in again.';
    }
    
    res.render('login', { 
        title: "Login", 
        message: message 
    });
});

// Handle login form submission
router.post('/login', async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const usersCollection = db.collection('users');

        // Find user by email
        const user = await usersCollection.findOne({ email: req.body.email });
        if (!user) return res.send("User not found.");
        
        // Check if account is active
        if (user.accountStatus !== 'active') return res.send("Account is not active.");

        // Compare hashed password
        const isPasswordValid = await bcrypt.compare(req.body.password,
        user.passwordHash);

        if (!user.isEmailVerified) {
            return res.send(`
                <p>Please verify your email before logging in.</p>
            `);
        }
        
        if (isPasswordValid) {
            // Store session
            req.session.user = {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            };
            res.redirect('/users/dashboard');
        } else {
            res.send("Invalid password.");
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.send("Something went wrong.");
    }
});

// Dashboard route
router.get('/dashboard', (req, res) => {
    if (!req.session.user) return res.redirect('/users/login');
    res.render('dashboard', { title: "User Dashboard", user: req.session.user });
});

// Admin view
router.get('/admin', async (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send("Access denied.");
    }
    const db = req.app.locals.client.db(req.app.locals.dbName);
    const users = await db.collection('users').find().toArray();
    res.render('admin', {
        title: "Admin Dashboard",
        users,
        currentUser: req.session.user
    });
});



// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
    if (err) {
        console.error("Error destroying session:", err);
        return res.send("Something went wrong during logout.");
    }
    res.redirect('/users/login?message=logout');
    });
});





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


/*
//old setup w/o pw hashing

const { MongoClient } = require('mongodb');
require('dotenv').config();
const { ObjectId } = require('mongodb');

// MongoDB setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = "ecommerceDB";


// Handle form submission
router.post('/register', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        // Get form data
        const newUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        };
        // Insert into MongoDB
        await usersCollection.insertOne(newUser);
            res.send("User registered successfully!");
    } catch (err) {
        console.error("Error saving user:", err);
        res.send("Something went wrong.");
    }
});


// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/users/login');
});

*/
module.exports = router;