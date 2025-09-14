class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    async showAllProducts(req, res) {
        try {
            const products = await this.productService.getAllProducts();
            res.render('products', { 
                title: 'Products', 
                products 
            });
        } catch (err) {
            console.error("Error fetching products:", err);
            res.send("Something went wrong.");
        }
    }

    // Admin only - show all products including inactive ones
    async showAdminProducts(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).send("Access denied.");
            }
            
            const products = await this.productService.getAllProductsAdmin();
            res.render('products-admin', { 
                title: 'Manage Products', 
                products 
            });
        } catch (err) {
            console.error("Error fetching products:", err);
            res.send("Something went wrong.");
        }
    }

    async showProduct(req, res) {
        try {
            const product = await this.productService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).send("Product not found.");
            }
            res.render('product-detail', { 
                title: product.name, 
                product 
            });
        } catch (err) {
            console.error("Error fetching product:", err);
            res.send("Something went wrong.");
        }
    }

    showCreateForm(req, res) {
        if (!req.session.user || req.session.user.role !== 'admin') {
            return res.status(403).send("Access denied.");
        }
        res.render('product-create', { title: 'Add Product' });
    }

    async createProduct(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).send("Access denied.");
            }
            
            await this.productService.createProduct(req.body);
            res.redirect('/products/admin');
        } catch (err) {
            console.error("Error creating product:", err);
            res.send("Something went wrong.");
        }
    }

    async showEditForm(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).send("Access denied.");
            }
            
            const product = await this.productService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).send("Product not found.");
            }
            res.render('product-edit', { 
                title: 'Edit Product', 
                product 
            });
        } catch (err) {
            console.error("Error fetching product:", err);
            res.send("Something went wrong.");
        }
    }

    async updateProduct(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).send("Access denied.");
            }
            
            // Convert string values to appropriate types
            const updateData = {
                ...req.body,
                price: parseFloat(req.body.price),
                stock: parseInt(req.body.stock),
                isActive: req.body.isActive === 'true' // Convert string to boolean
            };
            
            await this.productService.updateProduct(req.params.id, updateData);
            res.redirect('/products/admin');
        } catch (err) {
            console.error("Error updating product:", err);
            res.send("Something went wrong.");
        }
    }

    async deleteProduct(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.status(403).send("Access denied.");
            }
            
            await this.productService.deleteProduct(req.params.id);
            res.redirect('/products/admin');
        } catch (err) {
            console.error("Error deleting product:", err);
            res.send("Something went wrong.");
        }
    }
}

module.exports = ProductController;