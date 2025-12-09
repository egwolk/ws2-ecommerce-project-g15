const { v4: uuidv4 } = require('uuid');

class Order {
    constructor(data = {}) {
        this._id = data._id;
        this.orderId = data.orderId || uuidv4();
        this.userId = data.userId || '';

        // items: array of { productId, name, price }
        this.items = Array.isArray(data.items) ? data.items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: typeof item.price === 'number' ? item.price : Number(item.price) || 0
        })) : [];

        this.totalAmount = data.totalAmount !== undefined ? Number(data.totalAmount) : this.items.reduce((s, it) => s + (Number(it.price) || 0), 0);
        this.orderStatus = data.orderStatus || 'to_pay';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Recalculate totalAmount, update updatedAt
    recalcTotals() {
        this.items = this.items.map(it => {
            const price = Number(it.price) || 0;
            return Object.assign({}, it, { price });
        });
        this.totalAmount = this.items.reduce((s, it) => s + (it.price || 0), 0);
        this.updatedAt = new Date();
    }

    static fromDocument(doc) {
        if (!doc) return null;
        return new Order({
            _id: doc._id,
            orderId: doc.orderId,
            userId: doc.userId,
            items: Array.isArray(doc.items) ? doc.items.map(i => ({
                productId: i.productId,
                name: i.name,
                price: i.price
            })) : [],
            totalAmount: doc.totalAmount,
            orderStatus: doc.orderStatus,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    toDocument() {
        const doc = {
            orderId: this.orderId,
            userId: this.userId,
            items: Array.isArray(this.items) ? this.items.map(i => ({
                productId: i.productId,
                name: i.name,
                price: i.price
            })) : [],
            totalAmount: this.totalAmount,
            orderStatus: this.orderStatus,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };

        if (this._id) doc._id = this._id;
        return doc;
    }
}

module.exports = Order;
