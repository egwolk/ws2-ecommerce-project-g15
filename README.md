# DigiMArt - E-Commerce Web Application

A full-stack digital marketplace built for WEBSYS2 college class, specializing in digital products and art sales.

## 🌐 Live Demo

**Deployed URL**: [https://ws2-ecommerce-project-g15.onrender.com/](https://ws2-ecommerce-project-g15.onrender.com/)

### Test Accounts

| Role | Email | Password | Status |
|------|-------|----------|---------|
| **Customer** | `cus@to.mer` | `Customer1!` | Active |
| **Inactive User** | `inactive@ina.ctive` | `Inactive1!` | Inactive |
| **Admin** | `test5@test5.test` | `Welcome 2025` | Active |

> **Note**: To test the registration functionality, you must run the app locally as it requires Resend email service for verification.

## 🚀 Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Express-session** - Session management
- **Bcrypt** - Password hashing
- **Resend** - Email service for verification
- **Multer** - File upload handling
- **EJS** - Templating engine
- **dotenv** - Environment variables

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling with custom properties
- **JavaScript (ES6+)** - Client-side functionality
- **EJS Templating** - Server-side rendering
- **Responsive Design** - Mobile-first approach

### Development Tools
- **Nodemon** - Development server
- **Git** - Version control
- **Render** - Deployment platform

## ✨ Current Features

### 🔐 Authentication & Authorization
- ✅ User registration with email verification
- ✅ Secure login/logout system
- ✅ Password strength validation with real-time feedback
- ✅ Role-based access control (Admin/Customer)
- ✅ Password reset functionality
- ✅ Session management
- ✅ Account status management (Active/Inactive)

### 👥 User Management
- ✅ User dashboard
- ✅ Profile editing
- ✅ Admin user management (CRUD operations)
- ✅ Admin user creation
- ✅ UUID-based user identification

### 🛍️ Product Management
- ✅ Product catalog with grid layout
- ✅ Product creation/editing (Admin only)
- ✅ Image upload functionality
- ✅ Product categories
- ✅ Featured products showcase
- ✅ Product detail pages
- ✅ Digital product optimization (no stock management)

### 🎨 User Interface
- ✅ Responsive design (mobile-first)
- ✅ Dark theme with warm color palette
- ✅ Animated corner decorations
- ✅ Consistent button system with slide animations
- ✅ Dropdown navigation
- ✅ Professional error pages (404, 401/403)
- ✅ Modern homepage with hero section

### 🔒 Security
- ✅ Access denied pages for unauthorized access
- ✅ Input validation and sanitization
- ✅ Secure password hashing
- ✅ Protected admin routes
- ✅ CORS configuration

### 📧 Email Integration
- ✅ Email verification for new accounts
- ✅ Password reset emails
- ✅ HTML email templates

## 🚧 Future Implementations

### 📧 Enhanced Email Services
- [ ] **Brevo Integration** - Advanced email marketing and automation
- [ ] Order confirmation emails
- [ ] Newsletter subscription system

### 🛒 E-Commerce Core
- [ ] **Shopping Cart** - Add/remove items, quantity management
- [ ] **Payment Integration** - Stripe/PayPal integration
- [ ] Order management system
- [ ] Digital product delivery system
- [ ] Invoice generation

### 🔍 Search & Navigation
- [ ] **Product Search** - Full-text search functionality
- [ ] **Category Filters** - Filter products by category, price, etc.
- [ ] Advanced sorting options
- [ ] Pagination for product listings

### 📄 Legal Pages
- [ ] **Terms & Conditions** page
- [ ] **Privacy Policy** page
- [ ] Cookie consent management
- [ ] GDPR compliance features

### 🎨 UI/UX Improvements
- [ ] **Enhanced Product Gallery** - Multiple images, zoom functionality
- [ ] User reviews and ratings system
- [ ] Wishlist functionality
- [ ] Recently viewed products
- [ ] Advanced loading states and animations
- [ ] Dark/light theme toggle

### 📊 Analytics & Management
- [ ] Sales dashboard for admins
- [ ] Order tracking system
- [ ] Inventory management
- [ ] Customer analytics
- [ ] Revenue reporting

### 🔧 Technical Enhancements
- [ ] API documentation
- [ ] Unit and integration testing
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] PWA functionality

## 🏃‍♂️ Running the Application

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database
- Resend API key (for email functionality)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/egwolk/ws2-ecommerce-project-g15.git
   cd ws2-ecommerce-project-g15
   ```

2. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Configure Environment Variables**
   ```env
   MONGO_URI=your_mongodb_connection_string
   NODE_ENV=development
   BASE_URL=http://localhost:3000
   SESSION_SECRET=your_secure_session_secret
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=your_verified_sender_email
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # or
   nodemon server.js
   ```

6. **Access the application**
   - Local URL: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3000/users/admin`
   - Products: `http://localhost:3000/products`

### Production Deployment

The application is configured for deployment on Render.com:

1. Set `NODE_ENV=production`
2. Update `BASE_URL` to your domain
3. Ensure MongoDB allows connections from your deployment platform
4. Configure environment variables in your hosting platform

## 📁 Project Structure

```
ws2-ecommerce-project-g15/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── middleware/     # Custom middleware
│   ├── connection/     # Database connection
│   └── server.js       # Entry point
├── frontend/
│   ├── views/          # EJS templates
│   ├── layouts/        # Page layouts
│   ├── components/     # Reusable components
│   ├── styles/         # CSS files
│   └── scripts/        # Client-side JavaScript
└── README.md
```

## 🔄 Development Workflow

1. **Feature Development**: Create feature branches from `main`
2. **Testing**: Test locally with all user roles
3. **Deployment**: Push to `main` triggers automatic deployment on Render
4. **Monitoring**: Check deployed application functionality

## 📞 Support

For any issues or questions regarding this project:
- Check the deployed demo first
- Verify local environment setup
- Review error logs for debugging

## 🎓 Academic Context

This project is developed as part of the WEBSYS2 (Web Systems and Technologies 2) college course, demonstrating:
- Full-stack web development skills
- Database design and management
- User authentication and authorization
- Responsive web design
- Deployment and DevOps practices

---

**Made with 💗 by Erin Drew Covacha [@egwolk](https://github.com/egwolk)**