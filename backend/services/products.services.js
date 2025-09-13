const Product = require('../models/products.model');
const { ObjectId } = require('mongodb');

class ProductService {
    constructor(client, dbName) {
        this.client = client;
        this.dbName = dbName;
    }

    async getAllProducts() {
        const db = this.client.db(this.dbName);
        const docs = await db.collection('products').find({ isActive: true }).toArray();
        return docs.map(doc => Product.fromDocument(doc));
    }

    async getProductById(productId) {
        const db = this.client.db(this.dbName);
        const doc = await db.collection('products').findOne({ _id: new ObjectId(productId) });
        return Product.fromDocument(doc);
    }

    async createProduct(productData) {
        const product = new Product(productData);
        const db = this.client.db(this.dbName);
        
        const result = await db.collection('products').insertOne(product.toDocument());
        return { ...product, _id: result.insertedId };
    }

    async updateProduct(productId, updateData) {
        updateData.updatedAt = new Date();
        
        const db = this.client.db(this.dbName);
        await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: updateData }
        );
    }

    async deleteProduct(productId) {
        const db = this.client.db(this.dbName);
        await db.collection('products').updateOne(
            { _id: new ObjectId(productId) },
            { $set: { isActive: false, updatedAt: new Date() } }
        );
    }

    async searchProducts(query) {
        const db = this.client.db(this.dbName);
        const docs = await db.collection('products').find({
            isActive: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).toArray();
        return docs.map(doc => Product.fromDocument(doc));
    }
}

module.exports = ProductService;