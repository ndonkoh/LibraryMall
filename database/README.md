# LibraryMall JSON Database Structure

## Files Overview

### `users.json`
Contains user accounts with fields:
- `userid` - Unique user ID
- `username` - Display name
- `email` - Email address (used for login)
- `password` - Hashed password
- `role` - User role ('admin' or 'user')

### `books.json`
Contains book inventory with fields:
- `book_id` - Unique book ID
- `bookname` - Book title
- `author` - Author name
- `price` - Book price
- `category` - Book category (fantasy, scifi, self_help, business, romance, history, mystery)
- `quantity` - Available stock quantity
- `date_added` - When book was added to inventory

### `orders.json`
Contains order history with fields:
- `order_id` - Unique order ID
- `userid` - User who placed the order
- `order_type` - 'buy' or 'loan'
- `amount` - Total order amount
- `status` - 'pending', 'completed', 'approved', 'rejected'
- `order_date` - When order was placed
- `items` - Array of ordered items with book details

## Sample Data

The database includes realistic sample data:
- 4 user accounts (1 admin, 3 regular users)
- 20 books across all categories
- 6 sample orders (both buy and loan types, various statuses)

## Usage

All data is automatically loaded and managed by the `config/jsonDatabase.js` helper class.
