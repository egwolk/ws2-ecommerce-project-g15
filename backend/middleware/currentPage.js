module.exports = (app) => {
    app.use((req, res, next) => {
        try {
            const path = req.path || req.url || '';
            let currentPage = '';
            
            // Ensure path is a string
            if (typeof path !== 'string') {
                res.locals.currentPage = '';
                return next();
            }
            
            if (path === '/') {
                currentPage = 'home';
            } else if (path.startsWith('/products/admin')) {
                currentPage = 'products-admin';
            } else if (path.startsWith('/products')) {
                currentPage = 'products';
            } else if (path.startsWith('/users/dashboard')) {
                currentPage = 'dashboard';
            } else if (path.startsWith('/users/admin')) {
                currentPage = 'admin';
            } else if (path.startsWith('/users/login')) {
                currentPage = 'login';
            } else if (path.startsWith('/users/register')) {
                currentPage = 'register';
            }
            
            res.locals.currentPage = currentPage;
            next();
        } catch (error) {
            console.error('Error in currentPage middleware:', error);
            res.locals.currentPage = '';
            next();
        }
    });
};