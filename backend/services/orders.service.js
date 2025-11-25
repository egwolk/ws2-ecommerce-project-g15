const { v4: uuidv4 } = require('uuid');

class OrdersService {
    constructor(client, dbName) {
        this.client = client;
        this.dbName = dbName;
    }

    async getProductsByIds(productIds) {
        const db = this.client.db(this.dbName);
        const productsCollection = db.collection('products');
        return productsCollection.find({ productId: { $in: productIds } }).toArray();
    }

    async insertOrder(orderDoc) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        return ordersCollection.insertOne(orderDoc);
    }

    async createOrderForUser(userId, itemsFromClient) {
        const productIds = itemsFromClient.map(item => item.productId);
        const products = await this.getProductsByIds(productIds);

        const orderItems = itemsFromClient.map(item => {
            const product = products.find(p => p.productId === item.productId);
            const quantity = parseInt(item.quantity, 10) || 1;
            const price = product ? Number(product.price) : 0;
            const subtotal = price * quantity;
            return {
                productId: item.productId,
                name: product ? product.name : 'Unknown',
                price,
                quantity,
                subtotal
            };
        });

        const totalAmount = orderItems.reduce((sum, it) => sum + (it.subtotal || 0), 0);
        const now = new Date();

        const newOrder = {
            orderId: uuidv4(),
            userId,
            items: orderItems,
            totalAmount,
            orderStatus: 'to_pay',
            createdAt: now,
            updatedAt: now
        };

        await this.insertOrder(newOrder);
        return newOrder;
    }
}

module.exports = OrdersService;
