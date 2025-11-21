const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

const { requireLogin } = require("../middleware/auth");

// POST /orders/checkout – create a new order
router.post("/checkout", requireLogin, async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");
        const user = req.session.user;
        // Expect items from body: [{ productId, quantity }, ...]
        const itemsFromClient = req.body.items || [];
        if (!Array.isArray(itemsFromClient) || itemsFromClient.length === 0) {
            return res.status(400).send("No items provided for checkout.");
        }
        // Get all productIds from the request
        const productIds = itemsFromClient.map(item => item.productId);
        // Load product data from the products collection
        const products = await productsCollection
        .find({ productId: { $in: productIds } })
        .toArray();
        // Build order items and compute subtotals
        const orderItems = itemsFromClient.map(item => {
            const product = products.find(p => p.productId === item.productId);
            const quantity = parseInt(item.quantity, 10) || 1;
            const price = product ? Number(product.price) : 0;
            const subtotal = price * quantity;
            return {
                productId: item.productId,
                name: product ? product.name : "Unknown",
                price,
                quantity,
                subtotal
            };
        });
        // Compute totalAmount
        const totalAmount = orderItems.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );
        const now = new Date();
        const newOrder = {
            orderId: uuidv4(),
            userId: user.userId,
            items: orderItems,
            totalAmount,
            orderStatus: "to_pay",
            createdAt: now,
            updatedAt: now
        };
        await ordersCollection.insertOne(newOrder);
        // For now, send a simple message
        res.send("Order placed successfully.");

        // Later, you can redirect to /user/orders or show a confirmation page
    } catch (err) {
        console.error("Error during checkout:", err);
        res.status(500).send("Error placing order.");
    }
});
module.exports = router;