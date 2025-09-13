const { v4: uuidv4 } = require('uuid');

class Product {
    constructor(data = {}) {
        this._id = data._id;
        this.productId = data.productId || uuidv4();
        this.name = data.name || '';
        this.description = data.description || '';
        this.price = data.price || 0;
        this.category = data.category || '';
        this.stock = data.stock || 0;
        this.imageUrl = data.imageUrl || '';
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Convert MongoDB document to Product instance
    static fromDocument(doc) {
        if (!doc) return null;
        return new Product({
            _id: doc._id,
            productId: doc.productId,
            name: doc.name,
            description: doc.description,
            price: doc.price,
            category: doc.category,
            stock: doc.stock,
            imageUrl: doc.imageUrl,
            isActive: doc.isActive,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }

    // Convert Product instance to MongoDB document
    toDocument() {
        const doc = {
            productId: this.productId,
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            stock: this.stock,
            imageUrl: this.imageUrl,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };

        if (this._id) {
            doc._id = this._id;
        }

        return doc;
    }
}

module.exports = Product;