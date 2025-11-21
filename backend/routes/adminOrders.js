const express = require("express");
const router = express.Router();
const { requireAdmin } = require("../middleware/auth");
// GET /admin/orders – list all orders for admins
router.get("/orders", requireAdmin, async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const ordersCollection = db.collection("orders");
        const usersCollection = db.collection("users");
        // Get all orders, newest first
        const orders = await ordersCollection
        .find()
        .sort({ createdAt: -1 })
        .toArray();
        // Extract unique userIds from orders
        const userIds = [...new Set(orders.map(order => order.userId))];
        // Load users for those userIds
        const users = await usersCollection
        .find({ userId: { $in: userIds } })
        .toArray();
        // Attach user email to each order
        const ordersWithUser = orders.map(order => {
            const user = users.find(u => u.userId === order.userId);
            return {
                ...order,
                userEmail: user ? user.email : "Unknown"
            };
        });
        res.render("admin-orders", {
            title: "Admin – Orders",
            currentPage: 'admin-orders',
            orders: ordersWithUser
        });
    } catch (err) {
        console.error("Error loading orders:", err);

        res.status(500).send("Error loading orders.");
    }
});
module.exports = router;