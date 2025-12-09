function getAuthData(req) {
    return {
        authenticated: req.session && req.session.user ? true : false,
        user: req.session ? req.session.user : null
    };
}

function addAuthDataToLocals(req, res, next) {
    const authData = getAuthData(req);
    res.locals.authenticated = authData.authenticated;
    res.locals.user = authData.user;
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).render('access-denied', { 
            title: 'Access Denied',
            authenticated: false,
            user: null
        });
    }
    
    if (req.session.user.role !== 'admin') {
        return res.status(403).render('access-denied', { 
            title: 'Access Denied',
            authenticated: true,
            user: req.session.user
        });
    }
    
    next();
}

function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).render('access-denied', {
            title: 'Access Denied',
            authenticated: false,
            user: null
        });
    }
    next();
}

function requireCustomer(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).render('access-denied', {
            title: 'Access Denied',
            authenticated: false,
            user: null,
            message: 'You must be logged in to access this page.'
        });
    }
    
    if (req.session.user.role === 'admin') {
        return res.status(403).render('access-denied', {
            title: 'Access Denied',
            authenticated: true,
            user: req.session.user,
            message: 'This page is only accessible to customers.'
        });
    }
    
    if (!req.session.user.isEmailVerified) {
        return res.status(403).render('access-denied', {
            title: 'Email Verification Required',
            authenticated: true,
            user: req.session.user,
            message: 'Please verify your email address to access this page. Check your inbox for the verification link.'
        });
    }
    
    next();
}

module.exports = {
    getAuthData,
    addAuthDataToLocals,
    requireAdmin,
    requireLogin,
    requireCustomer
};