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
            return res.redirect('/users/login?message=expired');
        }
        res.render('product-create', { title: 'Add Product' });
    }

    async createProduct(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.redirect('/users/login?message=expired');
            }
            
            await this.productService.createProduct(req.body);
            res.redirect('/products/admin');
        } catch (err) {
            console.error("Error creating product:", err);
            res.render('product-create', { 
                title: 'Add Product', 
                message: "Error creating product. Please try again.",
                formData: req.body
            });
        }
    }

    async showEditForm(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.redirect('/users/login?message=expired');
            }
            
            const product = await this.productService.getProductById(req.params.id);
            if (!product) {
                return res.render('product-edit', { 
                    title: 'Edit Product', 
                    message: "Product not found.",
                    product: { _id: req.params.id, name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '', isActive: true }
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
                product: { _id: req.params.id, name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '', isActive: true }
            });
        }
    }

    async updateProduct(req, res) {
        try {
            if (!req.session.user || req.session.user.role !== 'admin') {
                return res.redirect('/users/login?message=expired');
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
            const product = await this.productService.getProductById(req.params.id);
            res.render('product-edit', { 
                title: 'Edit Product', 
                message: "Error updating product. Please try again.",
                product: product || { _id: req.params.id, name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '', isActive: true },
                formData: req.body
            });
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