# 📚 WEBSYS2 Course Lessons - Simplified E-Commerce Project

> **⚠️ IMPORTANT NOTE**: This branch contains a **simplified version** of the DigiMArt e-commerce project, specifically designed for **easier implementation of course lessons only**.

## 🎯 Purpose of This Branch

This branch is created to provide a streamlined, educational version of the e-commerce project that focuses on core web development concepts without the complexity of the full production application. It's designed specifically for:

- **Step-by-step learning** of web development fundamentals
- **Easier understanding** of key concepts without overwhelming features
- **Gradual implementation** of e-commerce functionality
- **Course lesson follow-along** without production-level complexity

## 🔄 Relationship to Main Project

This simplified version is derived from the main DigiMArt project but with:

- **Reduced complexity** - Core features only
- **Simplified structure** - Easier to navigate and understand
- **Educational focus** - Designed for learning, not production
- **Step-by-step buildable** - Can be enhanced incrementally during lessons

The main DigiMArt project (on other branches) includes advanced features like:
- Complex UI/UX with animations and themes
- Advanced security implementations
- Email integration and verification
- Product management systems
- Deployment configurations
- And much more...

## 🏗️ Current Simple Structure

```
ws2-ecommerce-project-g15/
├── server.js              # Main server file
├── package.json           # Dependencies
├── routes/                # Route handlers
│   ├── index.js          # Home routes
│   ├── users.js          # User management routes
│   └── password.js       # Password reset routes
├── views/                 # EJS templates
│   ├── index.ejs         # Home page
│   ├── login.ejs         # Login form
│   ├── register.ejs      # Registration form
│   ├── dashboard.ejs     # User dashboard
│   └── ...               # Other basic views
└── README.md             # This file
```

## 🚀 Quick Start for Course Lessons

### Prerequisites
- Node.js (v14 or higher)
- MongoDB database (local or Atlas)
- Basic understanding of JavaScript, HTML, and CSS

### Setup Instructions

1. **Clone this repository** (if not already done):
   ```bash
   git clone https://github.com/egwolk/ws2-ecommerce-project-g15.git
   cd ws2-ecommerce-project-g15
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   MONGO_URI=your_mongodb_connection_string
   DB_NAME=ecommerceDB
   SESSION_SECRET=your_secret_key
   PORT=3000
   ```

4. **Start the development server**:
   ```bash
   npm run serve
   ```

5. **Open your browser**:
   Navigate to `http://localhost:3000`

## 📖 What You'll Learn

Through this simplified version, you'll implement and understand:

### Phase 1: Basic Setup ✅
- [x] Express.js server setup
- [x] EJS templating engine
- [x] MongoDB connection
- [x] Basic routing structure
- [x] Session management

### Phase 2: User Authentication (Current Focus)
- [ ] User registration system
- [ ] Login/logout functionality
- [ ] Password hashing with bcrypt
- [ ] Session-based authentication
- [ ] Password reset functionality

### Phase 3: Core E-Commerce Features
- [ ] Product listing
- [ ] Product details pages
- [ ] Shopping cart functionality
- [ ] Basic admin panel
- [ ] Order management

### Phase 4: Advanced Features
- [ ] Search functionality
- [ ] User profiles
- [ ] Email notifications
- [ ] Payment integration basics
- [ ] Data validation and security

## 🎓 Academic Context

This project is part of the **WEBSYS2 (Web Systems and Technologies 2)** course and demonstrates:

- **Full-stack development** using Node.js and MongoDB
- **MVC architecture** patterns
- **RESTful API** design principles
- **User authentication** and session management
- **Database design** and CRUD operations
- **Web security** best practices
- **Responsive design** concepts

## 📝 Course Lesson Integration

Each lesson will build upon this foundation:

1. **Lesson 1**: Server setup and routing
2. **Lesson 2**: Database integration
3. **Lesson 3**: User authentication
4. **Lesson 4**: CRUD operations
5. **Lesson 5**: Shopping cart implementation
6. **Lesson 6**: Admin functionality
7. **And more...**

## 🚧 Intentional Limitations

This simplified version intentionally excludes:

- Complex CSS animations and themes
- Advanced error handling
- Email verification systems
- File upload functionality
- Advanced security measures
- Production deployment configurations
- Complex UI components

These will be covered in the full DigiMArt project on other branches.

## 💡 Tips for Success

- **Follow along with each lesson** rather than trying to implement everything at once
- **Test frequently** as you add new features
- **Ask questions** if you get stuck on any concept
- **Experiment** with the code to understand how it works
- **Compare** with the full project to see advanced implementations

## 📞 Support

For help with course lessons:
- Refer to your course materials
- Check the console for error messages
- Verify your environment variables are set correctly
- Ensure MongoDB is running and accessible

## 🔗 Related Resources

- **Main DigiMArt Project**: Check other branches for the full-featured application
- **Course Materials**: Refer to your WEBSYS2 lesson plans
- **Documentation**: Express.js, MongoDB, EJS official docs

---

**📚 Educational Project for WEBSYS2 Course**  
**Made with 💗 by Erin Drew Covacha [@egwolk](https://github.com/egwolk)**

> Remember: This is a learning environment. Focus on understanding concepts rather than perfect implementation!