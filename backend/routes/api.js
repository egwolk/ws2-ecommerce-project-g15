const express = require('express');
const router = express.Router();

router.get('/check-session', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ expired: true });
    }
    
    // Check if session is expired
    const now = new Date();
    const expires = new Date(req.session.cookie._expires);
    
    if (now >= expires) {
        return req.session.destroy(err => {
            if (err) console.error("Error destroying session:", err);
            res.status(401).json({ expired: true });
        });
    }
    
    res.status(200).json({ expired: false });
});

module.exports = router;