const { handleUpload } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

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
                
                // Prepare product data
                const productData = { ...req.body };
                
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
                    product: { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '', isActive: true }
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
                product: { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '', isActive: true }
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
                        product: product || { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '', isActive: true },
                        formData: req.body
                    });
                }
                
                // Convert string values to appropriate types
                const updateData = {
                    ...req.body,
                    price: parseFloat(req.body.price),
                    isActive: req.body.isActive === 'true' // Convert string to boolean
                };
                
                // Get current product to handle old image deletion
                const currentProduct = await this.productService.getProductById(req.params.id);
                
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
                    product: product || { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '', isActive: true },
                    formData: req.body
                });
            }
        });
    }

    async deleteProduct(req, res) {
        try {
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
            
            res.redirect('/products/admin');
        } catch (err) {
            console.error("Error deleting product:", err);
            res.send("Something went wrong.");
        }
    }
}

module.exports = ProductController;