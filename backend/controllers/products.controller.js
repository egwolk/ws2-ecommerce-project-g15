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
            // Read optional search filters from query params
            const searchName = (req.query.searchName || '').trim();
            const searchCategory = (req.query.searchCategory || '').trim();

            // Build Mongo filter
            const filter = {};
            if (searchName) {
                filter.name = { $regex: searchName, $options: 'i' };
            }
            if (searchCategory) {
                // Case-insensitive partial match for category too
                filter.category = { $regex: searchCategory, $options: 'i' };
            }

            const products = await this.productService.getAllProductsAdmin(filter);

            // Read query parameters for messages
            const success = req.query.success;
            const action = req.query.action;
            const error = req.query.error;
            let message = null;
            if (success === '1' && action === 'created') {
                message = { type: 'success', text: 'Product created successfully.' };
            } else if (success === '1' && action === 'updated') {
                message = { type: 'success', text: 'Product updated successfully.' };
            } else if (success === '1' && action === 'deleted') {
                message = { type: 'success', text: 'Product deleted successfully.' };
            } else if (error === 'cannot_delete_used') {
                message = { type: 'error', text: 'Cannot delete this product because it is already used in one or more orders.' };
            }

            res.render('products-admin', {
                title: 'Manage Products',
                products,
                message,
                searchName,
                searchCategory
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
                        product: currentProduct || { _id: req.params.id, name: '', description: '', price: 0, category: '', imageUrl: '', isActive: true },
                        formData: validation.formData
                    });
                }

                // Convert string values to appropriate types and use normalized price
                const updateData = {
                    name: validation.formData.name,
                    description: validation.formData.description,
                    price: validation.priceNumber,
                    category: validation.formData.category,
                    isActive: req.body.isActive === 'true'
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