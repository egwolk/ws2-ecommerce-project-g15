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
            if (existingUser) {
                return res.render('register', { 
                    title: "Register", 
                    message: "User already exists with this email address.",
                    formData: req.body 
                });
            }

            // Create user
            const { user: newUser, token } = await this.userService.createUser(req.body);
            
            // Send verification email
            const baseUrl = process.env.BASE_URL;
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
                
                res.render('register', { 
                    title: "Register", 
                    message: "Registration successful! A verification link has been sent to your email address. Please check your inbox and verify your account before logging in."
                });
            } catch (emailError) {
                console.error("Failed to send email:", emailError);
                res.render('register', { 
                    title: "Register", 
                    message: "Registration successful, but there was an issue sending the verification email. Please contact support."
                });
            }
        } catch (err) {
            console.error("Error saving user:", err);
            res.render('register', { 
                title: "Register", 
                message: "Something went wrong during registration. Please try again.",
                formData: req.body 
            });
        }
    }

    async verifyEmail(req, res) {
        try {
            // Find user by token
            const user = await this.userService.getUserByToken(req.params.token);
            
            // Check if token exists
            if (!user) {
                return res.render('login', { 
                    title: "Login", 
                    message: "Invalid or expired verification link." 
                });
            }
            
            // Check if token is still valid
            if (user.tokenExpiry < new Date()) {
                return res.render('register', { 
                    title: "Register", 
                    message: "Verification link has expired. Please register again." 
                });
            }

            // Update user as verified
            await this.userService.verifyEmail(req.params.token);
            
            res.render('login', { 
                title: "Login", 
                message: "Email verified successfully! You can now log in to your account." 
            });
        } catch (err) {
            console.error("Error verifying user:", err);
            res.render('login', { 
                title: "Login", 
                message: "Something went wrong during verification. Please try again." 
            });
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
        let message = null;
        
        if (req.query.message === 'verified') {
            message = 'Email verified successfully! You can now register or login.';
        }
        
        res.render('register', { title: "Register", message: message });
    }

   async loginUser(req, res) {
    try {
        // Find user by email
        const user = await this.userService.getUserByEmail(req.body.email);
        if (!user) {
            return res.render('login', { 
                title: "Login", 
                message: "User not found with this email address.",
                formData: req.body // Preserve form data
            });
        }
        
        // Check if account is active
        if (user.accountStatus !== 'active') {
            return res.render('login', { 
                title: "Login", 
                message: "Account is not active. Please contact support.",
                formData: req.body
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.render('login', { 
                title: "Login", 
                message: "Please verify your email before logging in.",
                formData: req.body
            });
        }

        // Compare hashed password
        const isPasswordValid = await this.userService.validatePassword(user, req.body.password);
        
        if (isPasswordValid) {
            // Store session
            req.session.user = {
                _id: user._id,
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isEmailVerified: user.isEmailVerified
            };
            res.redirect('/users/dashboard');
        } else {
            return res.render('login', { 
                title: "Login", 
                message: "Invalid password. Please try again.",
                formData: req.body
            });
        }
    } catch (err) {
        console.error("Error during login:", err);
        res.render('login', { 
            title: "Login", 
            message: "Something went wrong. Please try again.",
            formData: req.body
        });
    }
}

    showDashboard(req, res) {
        if (!req.session.user) return res.redirect('/users/login');
        res.render('dashboard', { title: "User Dashboard"});
    }

    async showAdminDashboard(req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).send("Access denied.");
        }
        const allUsers = await this.userService.getAllUsers();

        const users = allUsers.filter(user => user._id.toString() !== req.session.user._id.toString());
        res.render('admin', {
            title: "Admin Dashboard",
            users
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

    async deleteUser(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).send("Access denied.");
            }
            
            await this.userService.deleteUser(req.params.id);
            res.redirect('/users/admin');
        } catch (err) {
            console.error("Error deleting user:", err);
            res.send("Something went wrong.");
        }
    }
    async showEditForm(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.redirect('/users/login?message=expired');
            }
            
            const user = await this.userService.getUserById(req.params.id);
            if (!user) {
                return res.render('edit-user', { 
                    title: "Edit User", 
                    message: "User not found.",
                    user: { _id: req.params.id } // Minimal user object to prevent template errors
                });
            }
            res.render('edit-user', { title: "Edit User", user: user });
        } catch (err) {
            console.error("Error loading user:", err);
            res.render('edit-user', { 
                title: "Edit User", 
                message: "Something went wrong loading the user.",
                user: { _id: req.params.id }
            });
        }
    }

    async updateUser(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.redirect('/users/login?message=expired');
            }
            
            await this.userService.updateUser(req.params.id, req.body);
            res.redirect('/users/admin');
        } catch (err) {
            console.error("Error updating user:", err);
            const user = await this.userService.getUserById(req.params.id);
            res.render('edit-user', { 
                title: "Edit User", 
                message: "Error updating user. Please try again.",
                user: user || { _id: req.params.id },
                formData: req.body
            });
        }
    }

    async showEditProfileForm(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/users/login?message=expired');
            }
            const user = await this.userService.getUserById(req.params.id);
            if (!user) {
                return res.render('edit-profile', { 
                    title: "Edit Profile", 
                    message: "User profile not found.",
                    user: { _id: req.params.id }
                });
            }
            res.render('edit-profile', { title: "Edit Profile", user: user });
        } catch (err) {
            console.error("Error loading user:", err);
            res.render('edit-profile', { 
                title: "Edit Profile", 
                message: "Something went wrong loading your profile.",
                user: { _id: req.params.id }
            });
        }
    }

    async updateUserProfile(req, res) {
        try {
            if (!req.session.user) {
                return res.redirect('/users/login?message=expired');
            }
            
            const { password, confirmPassword } = req.body;
            
            // If password is provided, confirmPassword must also be provided and match
            if (password || confirmPassword) {
                if (!password || !confirmPassword) {
                    const user = await this.userService.getUserById(req.params.id);
                    return res.render('edit-profile', { 
                        title: "Edit Profile", 
                        message: "Both password fields are required when changing your password.",
                        user: user,
                        formData: req.body
                    });
                }
                
                if (password !== confirmPassword) {
                    const user = await this.userService.getUserById(req.params.id);
                    return res.render('edit-profile', { 
                        title: "Edit Profile", 
                        message: "Passwords do not match.",
                        user: user,
                        formData: req.body
                    });
                }
                
                // Optional: Add minimum password length validation
                if (password.length < 6) {
                    const user = await this.userService.getUserById(req.params.id);
                    return res.render('edit-profile', { 
                        title: "Edit Profile", 
                        message: "Password must be at least 6 characters long.",
                        user: user,
                        formData: req.body
                    });
                }
            }
            
            await this.userService.updateUser(req.params.id, req.body);
            const updatedUser = await this.userService.getUserById(req.params.id);
            req.session.user = updatedUser.getSessionUser();
            
            res.render('edit-profile', { 
                title: "Edit Profile", 
                message: "Profile updated successfully!",
                user: updatedUser
            });
        } catch (err) {
            console.error("Error updating user profile:", err);
            const user = await this.userService.getUserById(req.params.id);
            res.render('edit-profile', { 
                title: "Edit Profile", 
                message: "Something went wrong updating your profile. Please try again.",
                user: user || { _id: req.params.id },
                formData: req.body
            });
        }
    }
    showAdminCreateForm(req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).send("Access denied.");
        }
        res.render('admin-create', { title: "Add New User" });
    }

    async createUserByAdmin(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).send("Access denied.");
            }

            // Check if user already exists
            const existingUser = await this.userService.getUserByEmail(req.body.email);
            if (existingUser) {
                return res.render('admin-create', { 
                    title: "Add New User", 
                    error: "User already exists with this email.",
                    formData: req.body 
                });
            }

            // Use the new admin creation method
            await this.userService.createUserByAdmin(req.body);
            res.redirect('/users/admin');
        } catch (err) {
            console.error("Error creating user by admin:", err);
            
            // Handle validation errors specifically
            if (err.message.includes('Invalid user data')) {
                return res.render('admin-create', { 
                    title: "Add New User", 
                    error: err.message,
                    formData: req.body 
                });
            }
            
            res.render('admin-create', { 
                title: "Add New User", 
                error: "Something went wrong: " + err.message,
                formData: req.body 
            });
        }
    }
}

module.exports = UserController;