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

module.exports = {
    getAuthData,
    addAuthDataToLocals
};