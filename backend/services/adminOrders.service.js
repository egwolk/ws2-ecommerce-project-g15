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
        
        // Try to find users by both userId field and _id field
        const users = await usersCollection.find({
            $or: [
                { userId: { $in: userIds } },
                { _id: { $in: userIds } }
            ]
        }).toArray();

        const ordersWithUser = orders.map(order => {
            // Try to match by userId first, then by _id
            const user = users.find(u => u.userId === order.userId || u._id === order.userId);
            return Object.assign({}, order, { userEmail: user ? user.email : 'Unknown' });
        });

        return ordersWithUser;
    }
}

module.exports = AdminOrdersService;
