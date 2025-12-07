class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }

    async checkout(req, res) {
        try {
            let user = req.session && req.session.user;
            // Debug: allow anonymous orders when enabled and devUserEmail provided
            if (!user && process.env.DEBUG_ALLOW_ANON_ORDER === 'true') {
                const devEmail = (req.body && req.body.devUserEmail) || '';
                if (devEmail) {
                    try {
                        const db = req.app.locals.client.db(req.app.locals.dbName);
                        const usersCollection = db.collection('users');
                        const found = await usersCollection.findOne({ email: devEmail });
                        if (found && found.userId) {
                            user = { userId: found.userId, email: found.email, role: found.role || 'user' };
                        }
                    } catch (e) {
                        console.warn('DEBUG anon order: user lookup failed:', e);
                    }
                }
            }
            // If still no user and debug flag is on, allow order with null userId
            if (!user && process.env.DEBUG_ALLOW_ANON_ORDER === 'true') {
                user = { userId: null };
            }
            if (!user) return res.status(401).send('Unauthorized. Please login.');

            const itemsFromClient = req.body.items || [];
            if (!Array.isArray(itemsFromClient) || itemsFromClient.length === 0) {
                return res.status(400).send('No items provided for checkout.');
            }

            await this.ordersService.createOrderForUser(user.userId, itemsFromClient);
            return res.send('Order placed successfully.');
        } catch (err) {
            console.error('Error during checkout:', err);
            return res.status(500).send('Error placing order.');
        }
    }
}

module.exports = OrdersController;
