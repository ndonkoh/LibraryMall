# 🚀 Quick Start Guide - LibraryMall

## Prerequisites
- Node.js 14+ installed
- MySQL Server installed and running
- npm or yarn package manager

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd LibraryMall
npm install
```

### Step 2: Set Up Database
```bash
# Open MySQL
mysql -u root -p

# Create database
CREATE DATABASE librarymall;
USE librarymall;

# Import schema
SOURCE database.sql;
EXIT;
```

### Step 3: Configure Environment
Create/Edit `.env` file in project root:
```
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=librarymall
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### Step 4: Start Server
```bash
npm start
```

✅ Server running at `http://localhost:3000`

---

## 🌐 Site Navigation

### User Pages
| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Browse popular books |
| Login | `/login.html` | User authentication |
| Signup | `/signup.html` | Create new account |
| Discover | `/discover.html` | Search & browse all books |
| Bookmarks | `/bookmark.html` | Saved books |

### Admin Pages
| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/admin` | Stats & overview |

---

## 🔑 Test Credentials

### Admin Account
- Email: `admin@librarymall.com`
- Password: `admin123`
- Role: Admin

### Demo User
- Email: `user@librarymall.com`
- Password: `user123`
- Role: User

*(Create these by signing up or inserting directly into database)*

---

## 🛠️ Key Features

### For Users ✅
- ✓ Register & Login with JWT
- ✓ Browse 1000+ books
- ✓ Search by title/author
- ✓ Purchase books
- ✓ Borrow books (loan)
- ✓ View order history
- ✓ Save bookmarks
- ✓ Manage profile

### For Admins ✅
- ✓ Dashboard with stats
- ✓ Add/Edit/Delete books
- ✓ Manage orders (approve/reject)
- ✓ View all borrowers
- ✓ Track revenue

---

## 📁 File Structure

**Backend:**
```
config/          → Database setup
controllers/     → Business logic
middleware/      → Auth & security
routes/          → API endpoints
server.js        → Main server
```

**Frontend:**
```
js/
├── api.js        → API calls
├── auth.js       → Login/Signup
├── books.js      → Book display
├── orders.js     → Cart/Orders
├── admin.js      → Admin functions
└── nav.js        → Navigation

*.html           → Page templates
*.css            → Stylesheets
```

---

## 🔗 API Examples

### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Books
```bash
curl http://localhost:3000/api/books/all?page=1&limit=12
```

### Create Order (with JWT token)
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "order_type": "buy",
    "items": [
      {"book_id": 1, "quantity": 2}
    ]
  }'
```

---

## 🐛 Troubleshooting

### "Cannot find module mysql2"
```bash
npm install mysql2
```

### "Connection refused" (MySQL)
- Check MySQL is running
- Verify DB credentials in .env
- Create database: `CREATE DATABASE librarymall;`

### "Port 3000 already in use"
```bash
# Change port in .env
PORT=3001
```

### "JWT token error"
- Token expired? Login again
- Token sent in header? Use: `Authorization: Bearer {token}`
- Secret key changed? Regenerate token

---

## 📊 Sample Data

Add books to test:
```sql
INSERT INTO books (bookname, author, price, category, quantity) VALUES
('A Game of Thrones', 'George R.R. Martin', 15.99, 'fantasy', 10),
('The Hobbit', 'J.R.R. Tolkien', 12.99, 'fantasy', 8),
('Atomic Habits', 'James Clear', 16.99, 'self_help', 5),
('Dune', 'Frank Herbert', 14.99, 'scifi', 6);
```

---

## 📚 Documentation
- See `README.md` for complete API documentation
- Check controller files for detailed implementation
- Review `.env.example` for all config options

---

## 🎯 Next Steps
1. ✅ Database setup complete
2. ✅ Server running
3. Go to http://localhost:3000
4. Sign up or login
5. Start browsing books!

---

**Happy coding! 🎉**
