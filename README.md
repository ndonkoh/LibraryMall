# LibraryMall - Complete Setup Guide

## Overview
LibraryMall is a full-stack web application for managing a library system with user authentication, book browsing, borrowing/purchasing, and admin dashboard.

## Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure
```
LibraryMall/
├── config/
│   └── database.js          # Database connection pool
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── bookController.js    # Books management
│   └── orderController.js   # Orders & purchases
├── middleware/
│   └── auth.js              # JWT middleware
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── books.js             # Books endpoints
│   └── orders.js            # Orders endpoints
├── js/                      # Frontend JavaScript
│   ├── api.js               # API helper functions
│   ├── auth.js              # Auth functions
│   ├── books.js             # Book display functions
│   ├── orders.js            # Order/cart functions
│   └── admin.js             # Admin dashboard
├── images/                  # Images directory
├── *.html                   # HTML pages
├── *.css                    # Stylesheets
├── server.js                # Main server file
├── package.json             # Dependencies
├── .env                     # Environment variables
└── database.sql             # Database schema
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd LibraryMall
npm install
```

### 2. Create MySQL Database
```bash
# Using MySQL CLI
mysql -u root -p
CREATE DATABASE librarymall;
USE librarymall;
SOURCE database.sql;
```

Or import the database.sql file through phpMyAdmin.

### 3. Configure Environment Variables
Edit `.env` file:
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password_here
DB_NAME=librarymall
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
```

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm install -g nodemon
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (Protected)
- `PUT /api/auth/profile` - Update profile (Protected)
- `POST /api/auth/change-password` - Change password (Protected)

### Books
- `GET /api/books/all` - Get all books (pagination & filters)
- `GET /api/books/search?query=...` - Search books
- `GET /api/books/:id` - Get book details
- `GET /api/books/category/:category` - Get books by category
- `POST /api/books` - Create book (Admin Only)
- `PUT /api/books/:id` - Update book (Admin Only)
- `DELETE /api/books/:id` - Delete book (Admin Only)
- `GET /api/books/admin/stats` - Get book statistics (Admin Only)

### Orders
- `POST /api/orders` - Create order (Protected)
- `GET /api/orders/user/my-orders` - Get user's orders (Protected)
- `GET /api/orders/:id` - Get order details (Protected)
- `GET /api/orders/admin/all` - Get all orders (Admin Only)
- `PUT /api/orders/:id/status` - Update order status (Admin Only)
- `GET /api/orders/admin/stats` - Get order statistics (Admin Only)

## Features

### User Features
✓ User Registration & Login
✓ Browse Books by Category
✓ Search Books
✓ View Book Details
✓ Add to Cart
✓ Purchase Books
✓ Borrow Books
✓ View Order History
✓ Save Bookmarks
✓ User Profile Management

### Admin Features
✓ Dashboard with Statistics
✓ Manage Books (CRUD)
✓ View All Orders
✓ Update Order Status
✓ View Order Statistics
✓ Inventory Management

## Frontend JavaScript Files

### api.js
- `setToken()` - Store JWT token
- `getToken()` - Retrieve JWT token
- `apiCall()` - Make API requests
- `showToast()` - Display notifications
- `formatDate()`, `formatCurrency()` - Utility functions

### auth.js
- `handleLogin()` - Login form handler
- `handleSignup()` - Signup form handler
- `handleLogout()` - Logout function
- `togglePassword()` - Show/hide password
- `getCurrentUser()` - Get logged-in user info
- `protectPage()` - Protect pages from unauthorized access
- `protectAdminPage()` - Protect admin pages

### books.js
- `getAllBooks()` - Fetch books from API
- `SearchBooks()` - Search functionality
- `displayBooks()` - Render books grid
- `viewBook()` - Show book details modal
- `addToCart()` - Add book to cart
- `borrowBook()` - Create loan order
- `setPill()` - Filter books

### orders.js
- `createOrder()` - Place order
- `getUserOrders()` - Fetch user orders
- `displayUserOrders()` - Show order history
- `displayCart()` - Show shopping cart
- `addToCart()` - Add to cart
- `removeFromCart()` - Remove from cart
- `clearCart()` - Empty cart

### admin.js
- `getDashboardStats()` - Fetch dashboard statistics
- `displayDashboardStats()` - Render stats cards
- `displayPendingOrders()` - Show pending orders
- `updateOrderStatus()` - Change order status
- `displayBooksManagement()` - Show books table
- `addNewBook()` - Add new book
- `deleteBook()` - Delete book

## Pages

### Public Pages
- `/` or `/homepage.html` - Home page with popular books
- `/login.html` - User login
- `/signup.html` - User registration
- `/discover.html` - Discover/browse books
- `/bookmark.html` - Saved books

### Protected Pages (Requires Login)
- User profile
- Order history
- Shopping cart

### Admin Pages (Requires Admin Role)
- `/admin` - Admin dashboard
- Book management
- Order management
- Statistics & reports

## Database Schema

### users
- userid (PK)
- username
- email (unique)
- password (hashed)
- phone
- role (user/admin/supplier)

### books
- book_id (PK)
- bookname
- author
- price
- category
- quantity
- image_path
- date_added

### orders
- order_id (PK)
- userid (FK)
- order_type (loan/buy)
- order_date
- status (pending/approved/completed/rejected)
- amount

### order_items
- order_items_id (PK)
- order_id (FK)
- book_id (FK)
- quantity
- price

### loans
- loan_id (PK)
- userid (FK)
- book_id (FK)
- loan_date
- due_date
- return_date (nullable)

## Authentication Flow

1. **Registration**
   - User submits email, password, username
   - Password is hashed using bcryptjs
   - User record created in database

2. **Login**
   - User submits email & password
   - Password verified against hash
   - JWT token generated and sent to client
   - Token stored in localStorage

3. **Protected Requests**
   - Token sent in Authorization header
   - Backend verifies JWT signature
   - Request processed if valid, rejected if invalid

4. **Logout**
   - Token removed from localStorage
   - API automatically redirects to login on next request

## Error Handling

All API responses follow this format:
```json
{
  "status": true/false,
  "message": "Response message",
  "data": {} // Optional data payload
}
```

## Security Notes
⚠️ Change `JWT_SECRET` in production
⚠️ Use HTTPS in production
⚠️ Validate all inputs on backend
⚠️ Use environment variables for sensitive data
⚠️ Keep dependencies updated

## Troubleshooting

### Database Connection Error
- Check MySQL is running
- Verify credentials in .env
- Check database name is correct

### JWT Token Errors
- Ensure token is sent in Authorization header as: `Bearer <token>`
- Check token hasn't expired
- Verify JWT_SECRET matches in .env

### CORS Errors
- Ensure API URL in js/api.js matches server URL
- Check CORS middleware is enabled in server.js

## Future Enhancements
- [ ] Email notifications
- [ ] Payment integration
- [ ] Advanced search filters
- [ ] User reviews & ratings
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Wishlist feature
- [ ] Book recommendations

## Support
For issues or questions, please check the API documentation above or review controller files for implementation details.
