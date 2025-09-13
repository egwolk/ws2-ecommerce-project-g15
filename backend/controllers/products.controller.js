class ProductController {
    constructor(productService) {
        this.productService = productService;
    }

    async showAllProducts(req, res) {
        try {
            const products = await this.productService.getAllProducts();
            res.render('products/index', { 
                title: 'Products', 
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
            res.render('products/show', { 
                title: product.name, 
                product 
            });
        } catch (err) {
            console.error("Error fetching product:", err);
            res.send("Something went wrong.");
        }
    }

    showCreateForm(req, res) {
        res.render('products/create', { title: 'Add Product' });
    }

    async createProduct(req, res) {
        try {
            await this.productService.createProduct(req.body);
            res.redirect('/products');
        } catch (err) {
            console.error("Error creating product:", err);
            res.send("Something went wrong.");
        }
    }

    async showEditForm(req, res) {
        try {
            const product = await this.productService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).send("Product not found.");
            }
            res.render('products/edit', { 
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
            await this.productService.updateProduct(req.params.id, req.body);
            res.redirect(`/products/${req.params.id}`);
        } catch (err) {
            console.error("Error updating product:", err);
            res.send("Something went wrong.");
        }
    }

    async deleteProduct(req, res) {
        try {
            await this.productService.deleteProduct(req.params.id);
            res.redirect('/products');
        } catch (err) {
            console.error("Error deleting product:", err);
            res.send("Something went wrong.");
        }
    }
}

module.exports = ProductController;