class AdminOrdersController {
    constructor(adminOrdersService) {
        this.adminOrdersService = adminOrdersService;
    }

    async listOrders(req, res) {
        try {
            const orders = await this.adminOrdersService.getAllOrdersWithUserEmails();
            res.render('admin-orders', {
                title: 'Admin – Orders',
                currentPage: 'admin-orders',
                orders
            });
        } catch (err) {
            console.error('Error loading orders:', err);
            res.status(500).send('Error loading orders.');
        }
    }
}

module.exports = AdminOrdersController;
