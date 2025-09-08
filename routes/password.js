const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Show forgot password form
router.get('/forgot', (req, res) => {
    res.render('forgot-password', { title: "Forgot Password" });
});

// Handle forgot password form submission
router.post('/forgot', async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const usersCollection = db.collection('users');

        // Find user by email
        const user = await usersCollection.findOne({ email: req.body.email });
        if (!user) {
            return res.send("No account found with this email.");
        }
        // Generate reset token and expiry (1 hour)
        const token = uuidv4();
        const expiry = new Date(Date.now() + 3600000);

        // Save token in database
        await usersCollection.updateOne(
            { email: user.email },
            { $set: { resetToken: token, resetExpiry: expiry } }
        );

        // Build reset URL
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/password/reset/${token}`;

        // Send email with Resend
        await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h2>Password Reset</h2>
                <p>Click below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
            `
        });
        res.send("If an account with that email exists, a reset link has been sent.");
    } catch (err) {
        console.error("Error in password reset:", err);
        res.send("Something went wrong.");
    }
});
module.exports = router;