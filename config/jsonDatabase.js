const fs = require('fs').promises;
const path = require('path');

class JsonDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '..', 'database');
    }

    async readFile(filename) {
        try {
            const filePath = path.join(this.dbPath, filename);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${filename}:`, error);
            return null;
        }
    }

    async writeFile(filename, data) {
        try {
            const filePath = path.join(this.dbPath, filename);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error(`Error writing ${filename}:`, error);
            return false;
        }
    }

    // Users operations
    async getUsers() {
        const data = await this.readFile('users.json');
        return data ? data.users : [];
    }

    async getUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(user => user.email === email);
    }

    async getUserById(id) {
        const users = await this.getUsers();
        return users.find(user => user.userid === parseInt(id));
    }

    async createUser(userData) {
        const data = await this.readFile('users.json');
        if (!data) return null;

        const newUser = {
            userid: data.nextUserId,
            ...userData,
            admin_request: userData.admin_request || 'none',
            usercode: userData.usercode || null
        };

        data.users.push(newUser);
        data.nextUserId++;

        const success = await this.writeFile('users.json', data);
        return success ? newUser : null;
    }

    async updateUser(id, updateData) {
        const data = await this.readFile('users.json');
        if (!data) return false;

        const userIndex = data.users.findIndex(user => user.userid === parseInt(id));
        if (userIndex === -1) return false;

        data.users[userIndex] = { ...data.users[userIndex], ...updateData };
        return await this.writeFile('users.json', data);
    }

    // Books operations
    async getBooks() {
        const data = await this.readFile('books.json');
        return data ? data.books : [];
    }

    async getBookById(id) {
        const books = await this.getBooks();
        return books.find(book => book.book_id === parseInt(id));
    }

    async createBook(bookData) {
        const data = await this.readFile('books.json');
        if (!data) return null;

        const newBook = {
            book_id: data.nextBookId,
            ...bookData,
            date_added: new Date().toISOString()
        };

        data.books.push(newBook);
        data.nextBookId++;

        const success = await this.writeFile('books.json', data);
        return success ? newBook : null;
    }

    async updateBook(id, updateData) {
        const data = await this.readFile('books.json');
        if (!data) return false;

        const bookIndex = data.books.findIndex(book => book.book_id === parseInt(id));
        if (bookIndex === -1) return false;

        data.books[bookIndex] = { ...data.books[bookIndex], ...updateData };
        return await this.writeFile('books.json', data);
    }

    async deleteBook(id) {
        const data = await this.readFile('books.json');
        if (!data) return false;

        const bookIndex = data.books.findIndex(book => book.book_id === parseInt(id));
        if (bookIndex === -1) return false;

        data.books.splice(bookIndex, 1);
        return await this.writeFile('books.json', data);
    }

    async searchBooks(query) {
        const books = await this.getBooks();
        const searchTerm = query.toLowerCase();
        
        return books.filter(book => 
            book.bookname.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm)
        );
    }

    async getBooksByCategory(category) {
        const books = await this.getBooks();
        return books.filter(book => book.category === category);
    }

    // Orders operations
    async getOrders() {
        const data = await this.readFile('orders.json');
        return data ? data.orders : [];
    }

    async getOrdersByUserId(userId) {
        const orders = await this.getOrders();
        return orders.filter(order => order.userid === parseInt(userId));
    }

    async createOrder(orderData) {
        const data = await this.readFile('orders.json');
        if (!data) return null;

        const newOrder = {
            order_id: data.nextOrderId,
            ...orderData,
            order_date: new Date().toISOString(),
            status: orderData.status || 'pending'
        };

        data.orders.push(newOrder);
        data.nextOrderId++;

        const success = await this.writeFile('orders.json', data);
        return success ? newOrder : null;
    }

    async updateOrder(id, updateData) {
        const data = await this.readFile('orders.json');
        if (!data) return false;

        const orderIndex = data.orders.findIndex(order => order.order_id === parseInt(id));
        if (orderIndex === -1) return false;

        data.orders[orderIndex] = { ...data.orders[orderIndex], ...updateData };
        return await this.writeFile('orders.json', data);
    }

    // Statistics
    async getBookStats() {
        const books = await this.getBooks();
        const totalBooks = books.length;
        const availableBooks = books.filter(book => book.quantity > 0).length;
        
        return {
            total_books: totalBooks,
            available_books: availableBooks,
            categories: [...new Set(books.map(book => book.category))]
        };
    }

    async getOrderStats() {
        const orders = await this.getOrders();
        const pendingOrders = orders.filter(order => order.status === 'pending').length;
        const completedOrders = orders.filter(order => order.status === 'completed').length;
        const totalRevenue = orders
            .filter(order => order.status === 'completed')
            .reduce((sum, order) => sum + (order.amount || 0), 0);
        
        return {
            pending_orders: pendingOrders,
            completed_orders: completedOrders,
            total_revenue: totalRevenue
        };
    }
}

module.exports = new JsonDatabase();
