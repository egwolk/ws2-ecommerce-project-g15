const verifyTurnstile = require('../utils/turnstileVerify');

async function requireTurnstile(req, res, next) {
    try {
        const token = req.body['cf-turnstile-response'];
        
        if (!token) {
            return res.status(400).render(req.route.path.includes('login') ? 'login' : 'register', {
                title: req.route.path.includes('login') ? 'Login' : 'Register',
                message: 'Please complete the verification.',
                formData: req.body
            });
        }

        const result = await verifyTurnstile(token, req.ip);
        
        if (!result.success) {
            return res.status(400).render(req.route.path.includes('login') ? 'login' : 'register', {
                title: req.route.path.includes('login') ? 'Login' : 'Register', 
                message: 'Verification failed. Please try again.',
                formData: req.body
            });
        }

        next();
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return res.status(500).render('500', { title: 'Server Error' });
    }
}

module.exports = { requireTurnstile };