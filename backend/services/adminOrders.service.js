class AdminOrdersService {
    constructor(client, dbName) {
        this.client = client;
        this.dbName = dbName;
    }

    async getAllOrdersWithUserEmails() {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        const usersCollection = db.collection('users');

        const orders = await ordersCollection.find().sort({ createdAt: -1 }).toArray();

        const userIds = [...new Set(orders.map(order => order.userId))];
        const users = await usersCollection.find({ userId: { $in: userIds } }).toArray();

        const ordersWithUser = orders.map(order => {
            const user = users.find(u => u.userId === order.userId);
            return Object.assign({}, order, { userEmail: user ? user.email : 'Unknown' });
        });

        return ordersWithUser;
    }
}

module.exports = AdminOrdersService;
