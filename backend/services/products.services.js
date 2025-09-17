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

    // Admin method to get all products including inactive
    async getAllProductsAdmin() {
        const db = this.client.db(this.dbName);
        const docs = await db.collection('products').find().toArray();
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
        // Get product first to delete associated image file
        const product = await this.getProductById(productId);
        
        const db = this.client.db(this.dbName);
        await db.collection('products').deleteOne({ _id: new ObjectId(productId) });
        
        return product; // Return product data so controller can delete image file
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