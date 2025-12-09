const express = require('express');
const router = express.Router();
const ProductService = require('../services/products.services');
const ProductController = require('../controllers/products.controller');
const { requireAdmin } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Validator copied from controller helper for use in this route (kept local to avoid circular imports)
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
        price: priceRaw,
        category
    };

    return { errors, formData, priceNumber: price };
}

// Create controller with app.locals when router is used
router.use((req, res, next) => {
    if (!req.productController) {
        const productService = new ProductService(req.app.locals.client, req.app.locals.dbName);
        req.productController = new ProductController(productService);
    }
    next();
});

// Admin routes FIRST (before parameterized routes)
router.get('/admin', requireAdmin, (req, res) => req.productController.showAdminProducts(req, res));
router.get('/admin/create', requireAdmin, (req, res) => req.productController.showCreateForm(req, res));
router.post('/admin/create', requireAdmin, (req, res) => req.productController.createProduct(req, res));
router.get('/admin/:id/edit', requireAdmin, (req, res) => req.productController.showEditForm(req, res));
router.post('/admin/:id/edit', requireAdmin, (req, res) => req.productController.updateProduct(req, res));
router.post('/admin/:id/delete', requireAdmin, (req, res) => req.productController.deleteProduct(req, res));

// Lightweight admin API-style add product (no file upload) - validates input and inserts product
router.post('/', requireAdmin, async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const productsCollection = db.collection('products');
        const { errors, formData, priceNumber } = validateProductInput(req.body);
        if (errors.length > 0) {
            // Validation failed – show form again with errors
            return res.status(400).render('product-create', {
                title: 'Add Product',
                message: errors.join(' '),
                formData
            });
        }

        const now = new Date();
        const newProduct = {
            productId: 'p-' + Date.now(),
            name: formData.name,
            description: formData.description,
            price: priceNumber,
            category: formData.category,
            createdAt: now,
            updatedAt: now
        };

        await productsCollection.insertOne(newProduct);
        // Success path – redirect back to admin list
        res.redirect('/products/admin?success=1&action=created');
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).send('Error creating product.');
    }
});

// Lightweight admin edit (no file upload) - validate and update product by productId
router.post('/edit/:productId', requireAdmin, async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const productsCollection = db.collection('products');
        const productId = req.params.productId;

        const { errors, formData, priceNumber } = validateProductInput(req.body);
        if (errors.length > 0) {
            // Validation failed – show edit form again with errors
            return res.status(400).render('product-edit', {
                title: 'Edit Product',
                message: errors.join(' '),
                formData,
                product: { productId, _id: productId }
            });
        }

        const now = new Date();
        await productsCollection.updateOne(
            { productId },
            {
                $set: {
                    name: formData.name,
                    description: formData.description,
                    price: priceNumber,
                    category: formData.category,
                    updatedAt: now
                }
            }
        );

        res.redirect('/products/admin?success=1&action=updated');
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).send('Error updating product.');
    }
});

// Lightweight admin delete (no file upload) - prevent deletion if product is used in orders
router.post('/delete/:productId', requireAdmin, async (req, res) => {
    try {
        const db = req.app.locals.client.db(req.app.locals.dbName);
        const productsCollection = db.collection('products');
        const ordersCollection = db.collection('orders');
        const productId = req.params.productId;

        // Check whether any orders reference this productId
        const used = await ordersCollection.findOne({ 'items.productId': productId });
        if (used) {
            return res.redirect('/products/admin?error=cannot_delete_used');
        }

        // Try to fetch product to delete associated image file if present
        const product = await productsCollection.findOne({ productId });
        if (product && product.imageUrl && product.imageUrl.startsWith('/assets/images/products/')) {
            const imagePath = path.join(__dirname, '../../frontend', product.imageUrl);
            try {
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            } catch (deleteErr) {
                console.error('Error deleting product image file:', deleteErr);
            }
        }

        await productsCollection.deleteOne({ productId });
        res.redirect('/products/admin?success=1&action=deleted');
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send('Error deleting product.');
    }
});

// Public product routes AFTER (parameterized routes last)
router.get('/', (req, res) => req.productController.showAllProducts(req, res));
router.get('/:id', (req, res) => req.productController.showProduct(req, res));

// Download route for purchased products
router.get('/:productId/download', async (req, res) => {
    try {
        // Check if user is logged in
        if (!req.session || !req.session.user) {
            return res.redirect('/users/login');
        }

        const db = req.app.locals.client.db(req.app.locals.dbName);
        const ordersCollection = db.collection('orders');
        const productsCollection = db.collection('products');
        const productId = req.params.productId;

        // Check if user has purchased this product (has completed order with it)
        const purchasedOrder = await ordersCollection.findOne({
            userId: req.session.user.userId,
            orderStatus: 'completed',
            'items.productId': productId
        });

        if (!purchasedOrder) {
            return res.status(403).send('You have not purchased this product.');
        }

        // Get product details
        const product = await productsCollection.findOne({ productId });
        if (!product) {
            return res.status(404).send('Product not found.');
        }

        // For demonstration, we'll send a text file with product info
        // In a real system, you'd serve the actual digital product file
        const downloadContent = `DIGITAL PRODUCT DOWNLOAD\n\n` +
            `Product: ${product.name}\n` +
            `Category: ${product.category}\n` +
            `Description: ${product.description}\n\n` +
            `Thank you for your purchase!\n` +
            `This is a demonstration download file.\n` +
            `In a production system, this would be your actual digital product.`;

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${product.name.replace(/[^a-z0-9]/gi, '_')}.txt"`);
        res.send(downloadContent);
    } catch (err) {
        console.error('Error downloading product:', err);
        res.status(500).send('Error downloading product.');
    }
});

module.exports = router;