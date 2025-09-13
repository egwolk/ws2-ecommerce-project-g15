const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async registerUser(req, res) {
        try {
            // Check if email already exists
            const existingUser = await this.userService.getUserByEmail(req.body.email);
            if (existingUser) return res.send("User already exists with this email.");

            // Create user
            const { user: newUser, token } = await this.userService.createUser(req.body);
            
            // Send verification email
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const verificationUrl = `${baseUrl}/users/verify/${token}`;
            
            try {
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL,
                    to: newUser.email,
                    subject: 'Verify your account',
                    html: `
                        <h2>Welcome, ${newUser.firstName}!</h2>
                        <p>Thank you for registering. Please verify your email by clicking the link below:</p>
                        <a href="${verificationUrl}">${verificationUrl}</a>
                    `
                });
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
            }

            res.send(`
                <h2>Registration Successful!</h2>
                <p>A verification link has been sent to your email address.</p>
                <p>Please check your inbox and verify your account before logging in.</p>
            `);
        } catch (err) {
            console.error("Error saving user:", err);
            res.send("Something went wrong.");
        }
    }

    async verifyEmail(req, res) {
        try {
            // Find user by token
            const user = await this.userService.getUserByToken(req.params.token);
            
            // Check if token exists
            if (!user) {
                return res.send("Invalid or expired verification link.");
            }
            
            // Check if token is still valid
            if (user.tokenExpiry < new Date()) {
                return res.send("Verification link has expired. Please register again.");
            }

            // Update user as verified
            await this.userService.verifyEmail(req.params.token);
            
            res.send(`
                <h2>Email Verified!</h2>
                <p>Your account has been verified successfully.</p>
                <a href="/users/login">Proceed to Login</a>
            `);
        } catch (err) {
            console.error("Error verifying user:", err);
            res.send("Something went wrong during verification.");
        }
    }

    showLoginForm(req, res) {
        let message = null;
        
        if (req.query.message === 'logout') {
            message = 'You have been logged out.';
        } else if (req.query.message === 'expired') {
            message = 'Your session has expired. Please log in again.';
        }
        
        res.render('login', { title: "Login", message: message });
    }

    showRegisterForm(req, res) {
        res.render('register', { title: "Register" });
    }

    async loginUser(req, res) {
        try {
            // Find user by email
            const user = await this.userService.getUserByEmail(req.body.email);
            if (!user) return res.send("User not found.");
            
            // Check if account is active
            if (user.accountStatus !== 'active') return res.send("Account is not active.");

            // Check if email is verified
            if (!user.isEmailVerified) {
                return res.send(`
                    <p>Please verify your email before logging in.</p>
                `);
            }

            // Compare hashed password
            const isPasswordValid = await this.userService.validatePassword(user, req.body.password);
            
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
    }

    showDashboard(req, res) {
        if (!req.session.user) return res.redirect('/users/login');
        res.render('dashboard', { title: "User Dashboard", user: req.session.user });
    }

    async showAdminDashboard(req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).send("Access denied.");
        }
        
        const users = await this.userService.getAllUsers();
        
        res.render('admin', {
            title: "Admin Dashboard",
            users,
            currentUser: req.session.user
        });
    }

    logoutUser(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                return res.send("Something went wrong during logout.");
            }
            res.redirect('/users/login?message=logout');
        });
    }
}

module.exports = UserController;