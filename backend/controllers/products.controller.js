const { handleUpload } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Helper to validate product inputs for admin forms
function validateProductInput(body) {
    const errors = [];
    const name = (body.name || "").trim();
    const description = (body.description || "").trim();
    const category = (body.category || "").trim();
    const priceRaw = (body.price || "").toString().trim();
    const price = Number(priceRaw);

    if (!name) {
        errors.push("Product name is required.");
    } else if (name.length < 2) {
        errors.push("Product name must be at least 2 characters.");
    }

    if (!description) {
        errors.push("Description is required.");
    } else if (description.length < 5) {
        errors.push("Description must be at least 5 characters.");
    }

    if (!priceRaw) {
        errors.push("Price is required.");
    } else if (Number.isNaN(price)) {
        errors.push("Price must be a valid number.");
    } else if (price <= 0) {
        errors.push("Price must be greater than 0.");
    }

    if (!category) {
        errors.push("Category is required.");
    }

    const formData = {
        name,
        description,
        price: priceRaw, // keep raw input for the form
        category
    };

    return { errors, formData, priceNumber: price };
}

class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    async showAllProducts(req, res) {
        try {
            const search = (req.query.search || '').trim();
            const showOwnedOnly = req.query.owned === 'true';
            let products;

            if (search) {
                // Search products by name or category
                const db = req.app.locals.client.db(req.app.locals.dbName);
                const docs = await db.collection('products').find({
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { category: { $regex: search, $options: 'i' } }
                    ]
                }).toArray();
                products = docs.map(doc => require('../models/products.model').fromDocument(doc));
            } else {
                products = await this.productService.getAllProducts();
            }

            // Check which products the user owns (for logged-in verified users)
            let ownedProductIds = [];
            if (req.session && req.session.user && req.session.user.isEmailVerified) {
                const OrdersService = require('../services/orders.service');
                const ordersService = new OrdersService(req.app.locals.client, req.app.locals.dbName);
                
                // Get all completed orders for this user
                const db = req.app.locals.client.db(req.app.locals.dbName);
                const completedOrders = await db.collection('orders').find({
                    userId: req.session.user.userId,
                    orderStatus: 'completed'
                }).toArray();
                
                // Extract all product IDs from completed orders
                completedOrders.forEach(order => {
                    if (order.items && Array.isArray(order.items)) {
                        order.items.forEach(item => {
                            if (item.productId && !ownedProductIds.includes(item.productId)) {
                                ownedProductIds.push(item.productId);
                            }
                        });
                    }
                });
                
                // Filter to show only owned products if requested
                if (showOwnedOnly) {
                    products = products.filter(product => ownedProductIds.includes(product.productId));
                }
            }

            res.render('products', { 
                title: 'Products', 
                products,
                search,
                ownedProductIds,
                showOwnedOnly
            });
        } catch (err) {
            console.error("Error fetching products:", err);
            res.send("Something went wrong.");
        }
    }

    // Admin only - show all products including inactive ones
    async showAdminProducts(req, res) {
        try {
            // Read search query from query params
            const search = (req.query.search || '').trim();

            // Build Mongo filter
            const filter = {};
            if (search) {
                // Search in both name and category
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ];
            }

            const products = await this.productService.getAllProductsAdmin(filter);

            // Read query parameters for messages
            const success = req.query.success;
            const action = req.query.action;
            const error = req.query.error;
            const productName = req.query.productName || '';
            let message = null;
            if (success === '1' && action === 'created') {
                message = { type: 'success', text: 'Product created successfully.' };
            } else if (success === '1' && action === 'updated') {
                message = { type: 'success', text: 'Product updated successfully.' };
            } else if (success === '1' && action === 'deleted') {
                message = { type: 'success', text: 'Product deleted successfully.' };
            } else if (error === 'in_orders') {
                message = { type: 'error', text: `Cannot delete "${productName}" because it is in one or more customer orders/carts.` };
            } else if (error === 'delete_failed') {
                message = { type: 'error', text: 'Failed to delete product. Please try again.' };
            } else if (error === 'cannot_delete_used') {
                message = { type: 'error', text: 'Cannot delete this product because it is already used in one or more orders.' };
            }

            res.render('products-admin', {
                title: 'Manage Products',
                products,
                message,
                search
            });
        } catch (err) {
            console.error("Error fetching products:", err);
            res.send("Something went wrong.");
        }
    }

    async showProduct(req, res) {
        try {
            // Try to find by MongoDB _id first (for backward compatibility)
            let product = null;
            try {
                product = await this.productService.getProductById(req.params.id);
            } catch (e) {
                // If it fails (not a valid ObjectId), try by productId
                product = await this.productService.getProductByProductId(req.params.id);
            }
            
            if (!product) {
                return res.status(404).send("Product not found.");
            }

            // Check if product is in user's cart (for logged-in users)
            let isInCart = false;
            let isPurchased = false;
            let purchaseDate = null;
            if (req.session && req.session.user) {
                const OrdersService = require('../services/orders.service');
                const ordersService = new OrdersService(req.app.locals.client, req.app.locals.dbName);
                isInCart = await ordersService.isProductInUserCart(req.session.user.userId, product.productId);
                isPurchased = await ordersService.hasUserPurchasedProduct(req.session.user.userId, product.productId);
                
                // If purchased, get the purchase date
                if (isPurchased) {
                    const db = req.app.locals.client.db(req.app.locals.dbName);
                    const completedOrder = await db.collection('orders').findOne({
                        userId: req.session.user.userId,
                        orderStatus: 'completed',
                        'items.productId': product.productId
                    }, {
                        sort: { createdAt: 1 } // Get the earliest completed order
                    });
                    
                    if (completedOrder && completedOrder.createdAt) {
                        purchaseDate = completedOrder.createdAt;
                    }
                }
            }

            // Check for messages
            let message = null;
            if (req.query.added === '1') {
                message = { type: 'success', text: 'Product added to cart successfully!' };
            } else if (req.query.removed === '1') {
                message = { type: 'success', text: 'Product removed from cart successfully!' };
            } else if (req.query.error === 'add_failed') {
                message = { type: 'error', text: 'Failed to add product to cart. Please try again.' };
            } else if (req.query.error === 'remove_failed') {
                message = { type: 'error', text: 'Failed to remove product from cart. Please try again.' };
            }
            
            res.render('product-detail', { 
                title: product.name, 
                product,
                isInCart,
                isPurchased,
                purchaseDate,
                message
            });
        } catch (err) {
            console.error("Error fetching product:", err);
            res.send("Something went wrong.");
        }
    }

    showCreateForm(req, res) {
        res.render('product-create', { title: 'Add Product' });
    }

    async createProduct(req, res) {
        // Handle file upload first
        handleUpload(req, res, async (uploadError) => {
            try {
                // Check for upload errors
                if (req.uploadError) {
                    return res.render('product-create', { 
                        title: 'Add Product', 
                        message: req.uploadError,
                        formData: req.body
                    });
                }
                // Validate input
                const validation = validateProductInput(req.body);
                if (validation.errors && validation.errors.length > 0) {
                    // cleanup uploaded file if present
                    if (req.file) {
                        try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Failed to delete uploaded file after validation error:', e); }
                    }
                    return res.render('product-create', {
                        title: 'Add Product',
                        message: validation.errors.join(' '),
                        formData: validation.formData
                    });
                }

                // Prepare product data using normalized values
                const productData = {
                    name: validation.formData.name,
                    description: validation.formData.description,
                    price: validation.priceNumber,
                    category: validation.formData.category
                };

                // Set image path if file was uploaded
                if (req.file) {
                    productData.imageUrl = `/assets/images/products/${req.file.filename}`;
                }

                await this.productService.createProduct(productData);
                res.redirect('/products/admin');
            } catch (err) {
                console.error("Error creating product:", err);
                
                // Delete uploaded file if product creation failed
                if (req.file) {
                    try {
                        fs.unlinkSync(req.file.path);
                    } catch (deleteErr) {
                        console.error("Error deleting uploaded file:", deleteErr);
                    }
                }
                
                res.render('product-create', { 
                    title: 'Add Product', 
                    message: "Error creating product. Please try again.",
                    formData: req.body
                });
            }
        });
    }

    async showEditForm(req, res) {
        try {
            const product = await this.productService.getProductById(req.params.id);
            if (!product) {
                return res.render('product-edit', { 
                    title: 'Edit Product', 
                    message: "Product not found.",
                    product: { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '' }
                });
            }
            res.render('product-edit', { 
                title: 'Edit Product', 
                product 
            });
        } catch (err) {
            console.error("Error fetching product:", err);
            res.render('product-edit', { 
                title: 'Edit Product', 
                message: "Something went wrong loading the product.",
                product: { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '' }
            });
        }
    }

    async updateProduct(req, res) {
        // Handle file upload first
        handleUpload(req, res, async (uploadError) => {
            try {
                // Check for upload errors
                if (req.uploadError) {
                    const product = await this.productService.getProductById(req.params.id);
                    return res.render('product-edit', { 
                        title: 'Edit Product', 
                        message: req.uploadError,
                        product: product || { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '' },
                        formData: req.body
                    });
                }
                // Get current product to render in case of validation errors and to delete old image if replaced
                const currentProduct = await this.productService.getProductById(req.params.id);

                // Validate input
                const validation = validateProductInput(req.body);
                if (validation.errors && validation.errors.length > 0) {
                    // cleanup uploaded file if present
                    if (req.file) {
                        try { fs.unlinkSync(req.file.path); } catch (e) { console.error('Failed to delete uploaded file after validation error:', e); }
                    }
                    return res.render('product-edit', {
                        title: 'Edit Product',
                        message: validation.errors.join(' '),
                        product: currentProduct || { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '' },
                        formData: validation.formData
                    });
                }

                // Convert string values to appropriate types and use normalized price
                const updateData = {
                    name: validation.formData.name,
                    description: validation.formData.description,
                    price: validation.priceNumber,
                    category: validation.formData.category
                };

                // Set new image path if file was uploaded
                if (req.file) {
                    updateData.imageUrl = `/assets/images/products/${req.file.filename}`;

                    // Delete old image file if it exists and is a local file
                    if (currentProduct && currentProduct.imageUrl && currentProduct.imageUrl.startsWith('/assets/images/products/')) {
                        const oldImagePath = path.join(__dirname, '../../frontend', currentProduct.imageUrl);
                        try {
                            if (fs.existsSync(oldImagePath)) {
                                fs.unlinkSync(oldImagePath);
                            }
                        } catch (deleteErr) {
                            console.error("Error deleting old image:", deleteErr);
                        }
                    }
                }

                await this.productService.updateProduct(req.params.id, updateData);
                res.redirect('/products/admin');
            } catch (err) {
                console.error("Error updating product:", err);
                
                // Delete uploaded file if product update failed
                if (req.file) {
                    try {
                        fs.unlinkSync(req.file.path);
                    } catch (deleteErr) {
                        console.error("Error deleting uploaded file:", deleteErr);
                    }
                }
                
                const product = await this.productService.getProductById(req.params.id);
                res.render('product-edit', { 
                    title: 'Edit Product', 
                    message: "Error updating product. Please try again.",
                    product: product || { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '' },
                    formData: req.body
                });
            }
        });
    }

    async deleteProduct(req, res) {
        try {
            // First, check if the product is in any orders
            const OrdersService = require('../services/orders.service');
            const ordersService = new OrdersService(req.app.locals.client, req.app.locals.dbName);
            
            // Get the product first to get its productId
            const product = await this.productService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).send("Product not found.");
            }
            
            // Check if product is in any orders
            const isInOrders = await ordersService.isProductInOrders(product.productId);
            
            if (isInOrders) {
                // Redirect back with error message
                return res.redirect('/products/admin?error=in_orders&productName=' + encodeURIComponent(product.name));
            }
            
            // Delete product and get product data to clean up image file
            const deletedProduct = await this.productService.deleteProduct(req.params.id);
            
            // Delete associated image file if it exists and is a local file
            if (deletedProduct && deletedProduct.imageUrl && deletedProduct.imageUrl.startsWith('/assets/images/products/')) {
                const imagePath = path.join(__dirname, '../../frontend', deletedProduct.imageUrl);
                try {
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath);
                        console.log('Deleted image file:', imagePath);
                    }
                } catch (deleteErr) {
                    console.error("Error deleting image file:", deleteErr);
                }
            }
            
            res.redirect('/products/admin?success=1&action=deleted');
        } catch (err) {
            console.error("Error deleting product:", err);
            res.redirect('/products/admin?error=delete_failed');
        }
    }
}

module.exports = ProductController;