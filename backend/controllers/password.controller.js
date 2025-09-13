const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

class PasswordController {
    constructor(passwordService) {
        this.passwordService = passwordService;
    }

    showForgotPasswordForm(req, res) {
        res.render('forgot-password', { title: "Forgot Password" });
    }

    async sendResetEmail(req, res) {
        try {
            const { email } = req.body;
            
            // Find user by email
            const user = await this.passwordService.findUserByEmail(email);
            if (!user) {
                return res.send("If an account with that email exists, a reset link has been sent.");
            }

            // Generate reset token
            const { token } = await this.passwordService.generateResetToken(email);

            // Build reset URL
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const resetUrl = `${baseUrl}/password/reset/${token}`;

            // Send email
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
    }

    async showResetPasswordForm(req, res) {
        try {
            const { token } = req.params;
            
            // Verify token is valid
            const user = await this.passwordService.findUserByResetToken(token);
            if (!user) {
                return res.send("Reset link is invalid or has expired.");
            }

            res.render('reset-password', { title: "Reset Password", token });
        } catch (err) {
            console.error("Error showing reset form:", err);
            res.send("Something went wrong.");
        }
    }

    async resetPassword(req, res) {
        try {
            const { token } = req.params;
            const { password, confirm } = req.body;

            // Find user by token
            const user = await this.passwordService.findUserByResetToken(token);
            if (!user) {
                return res.send("Reset link is invalid or has expired.");
            }

            // Check if passwords match
            if (password !== confirm) {
                return res.send("Passwords do not match.");
            }

            // Reset password
            await this.passwordService.resetPassword(user.email, password);

            res.send("Password has been reset. You can now log in with your new password.");
        } catch (err) {
            console.error("Error resetting password:", err);
            res.send("Something went wrong.");
        }
    }
}

module.exports = PasswordController;