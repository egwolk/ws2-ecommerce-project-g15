class OrdersController {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }

    async checkout(req, res) {
        try {
            const user = req.session && req.session.user;
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
