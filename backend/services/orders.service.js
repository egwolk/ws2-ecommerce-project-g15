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

    async getOrdersByUserId(userId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        return ordersCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
    }

    async getOrderById(orderId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        return ordersCollection.findOne({ orderId });
    }

    async removeItemFromOrder(orderId, productId, userId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        
        // Get the order first
        const order = await ordersCollection.findOne({ orderId, userId });
        if (!order) {
            throw new Error('Order not found or unauthorized');
        }
        
        // Filter out the item
        const updatedItems = order.items.filter(item => item.productId !== productId);
        
        // If no items left, delete the order
        if (updatedItems.length === 0) {
            await ordersCollection.deleteOne({ orderId, userId });
            return { deleted: true };
        }
        
        // Recalculate total
        const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        
        // Update the order
        await ordersCollection.updateOne(
            { orderId, userId },
            { 
                $set: { 
                    items: updatedItems,
                    totalAmount: newTotal,
                    updatedAt: new Date()
                }
            }
        );
        
        return { deleted: false, updatedItems };
    }

    async createOrderForUser(userId, itemsFromClient) {
        const productIds = itemsFromClient.map(item => item.productId);
        const products = await this.getProductsByIds(productIds);

        const orderItems = itemsFromClient.map(item => {
            const product = products.find(p => p.productId === item.productId);
            const price = product ? Number(product.price) : 0;
            return {
                productId: item.productId,
                name: product ? product.name : 'Unknown',
                price
            };
        });

        const totalAmount = orderItems.reduce((sum, it) => sum + (it.price || 0), 0);
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

    async isProductInOrders(productId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        
        // Check if product exists in any order items
        const orderWithProduct = await ordersCollection.findOne({
            'items.productId': productId
        });
        
        return !!orderWithProduct;
    }

    async removeProductFromUserCart(userId, productId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        
        // Find all to_pay orders for this user that contain the product
        const orders = await ordersCollection.find({
            userId,
            orderStatus: 'to_pay',
            'items.productId': productId
        }).toArray();
        
        // Remove the product from each order
        for (const order of orders) {
            const updatedItems = order.items.filter(item => item.productId !== productId);
            
            // If no items left, delete the order
            if (updatedItems.length === 0) {
                await ordersCollection.deleteOne({ orderId: order.orderId });
            } else {
                // Recalculate total and update
                const newTotal = updatedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
                await ordersCollection.updateOne(
                    { orderId: order.orderId },
                    { 
                        $set: { 
                            items: updatedItems,
                            totalAmount: newTotal,
                            updatedAt: new Date()
                        }
                    }
                );
            }
        }
    }

    async isProductInUserCart(userId, productId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        
        // Check if product exists in user's to_pay orders
        const orderWithProduct = await ordersCollection.findOne({
            userId,
            orderStatus: 'to_pay',
            'items.productId': productId
        });
        
        return !!orderWithProduct;
    }

    async hasUserPurchasedProduct(userId, productId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        
        // Check if product exists in user's completed orders
        const completedOrderWithProduct = await ordersCollection.findOne({
            userId,
            orderStatus: 'completed',
            'items.productId': productId
        });
        
        return !!completedOrderWithProduct;
    }

    async completeOrders(orderIds, userId) {
        const db = this.client.db(this.dbName);
        const ordersCollection = db.collection('orders');
        
        // Update all specified orders to completed status
        await ordersCollection.updateMany(
            {
                orderId: { $in: orderIds },
                userId: userId,
                orderStatus: 'to_pay'
            },
            {
                $set: {
                    orderStatus: 'completed',
                    updatedAt: new Date()
                }
            }
        );
    }
}

module.exports = OrdersService;
