const db = require('../config/jsonDatabase');

// Get all books with pagination
exports.getAllBooks = async (req, res) => {
    try {
        const { category, page = 1, limit = 12 } = req.query;
        const offset = (page - 1) * limit;

        let books;
        if (category && category !== 'all') {
            books = await db.getBooksByCategory(category);
        } else {
            books = await db.getBooks();
        }

        // Sort by date_added descending
        books.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));

        // Apply pagination
        const paginatedBooks = books.slice(offset, offset + parseInt(limit));
        const total = books.length;

        res.json({
            status: true,
            books: paginatedBooks,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get books error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch books' });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await db.getBookById(id);

        if (!book) {
            return res.status(404).json({ status: false, message: 'Book not found' });
        }

        res.json({ status: true, data: book });
    } catch (error) {
        console.error('Get book error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch book' });
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const { query, limit = 20 } = req.query;

        if (!query) {
            return res.status(400).json({ status: false, message: 'Search query required' });
        }

        const books = await db.searchBooks(query);
        const limitedBooks = books.slice(0, parseInt(limit));

        res.json({ status: true, data: limitedBooks });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ status: false, message: 'Search failed' });
    }
};

// Create book (Admin only)
exports.createBook = async (req, res) => {
    try {
        const { bookname, author, price, category, quantity, image_path } = req.body;

        if (!bookname || !author || !price || !category) {
            return res.status(400).json({ status: false, message: 'Missing required fields' });
        }

        const newBook = await db.createBook({
            bookname,
            author,
            price: parseFloat(price),
            category,
            quantity: parseInt(quantity) || 0,
            image_path: image_path || null
        });

        if (!newBook) {
            return res.status(500).json({ status: false, message: 'Failed to create book' });
        }

        res.status(201).json({
            status: true,
            message: 'Book created successfully',
            book_id: newBook.book_id
        });
    } catch (error) {
        console.error('Create book error:', error);
        res.status(500).json({ status: false, message: 'Failed to create book' });
    }
};

// Update book (Admin only)
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { bookname, author, price, category, quantity, image_path } = req.body;

        const updateData = {};
        if (bookname !== undefined) updateData.bookname = bookname;
        if (author !== undefined) updateData.author = author;
        if (price !== undefined) updateData.price = parseFloat(price);
        if (category !== undefined) updateData.category = category;
        if (quantity !== undefined) updateData.quantity = parseInt(quantity);
        if (image_path !== undefined) updateData.image_path = image_path;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ status: false, message: 'No fields to update' });
        }

        const success = await db.updateBook(id, updateData);
        if (!success) {
            return res.status(404).json({ status: false, message: 'Book not found' });
        }

        res.json({ status: true, message: 'Book updated successfully' });
    } catch (error) {
        console.error('Update book error:', error);
        res.status(500).json({ status: false, message: 'Failed to update book' });
    }
};

// Delete book (Admin only)
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const success = await db.deleteBook(id);

        if (!success) {
            return res.status(404).json({ status: false, message: 'Book not found' });
        }

        res.json({ status: true, message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Delete book error:', error);
        res.status(500).json({ status: false, message: 'Failed to delete book' });
    }
};

// Get books by category
exports.getByCategory = async (req, res) => {
    try {
        const { category, page = 1, limit = 12 } = req.params;
        const offset = (page - 1) * limit;

        const books = await db.getBooksByCategory(category);
        
        // Sort by date_added descending
        books.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));

        // Apply pagination
        const paginatedBooks = books.slice(offset, offset + parseInt(limit));
        const total = books.length;

        res.json({
            status: true,
            data: paginatedBooks,
            total
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch books' });
    }
};

// Get book stats (Admin)
exports.getBookStats = async (req, res) => {
    try {
        const stats = await db.getBookStats();

        res.json({
            status: true,
            data: stats
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch stats' });
    }
};

// Get all unique authors
exports.getAllAuthors = async (req, res) => {
    try {
        const books = await db.getBooks();
        const authors = [...new Set(books.map(book => book.author))].sort();

        res.json({
            status: true,
            data: authors
        });
    } catch (error) {
        console.error('Get authors error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch authors' });
    }
};

// Get books by author
exports.getByAuthor = async (req, res) => {
    try {
        const { author, page = 1, limit = 12 } = req.query;

        if (!author) {
            return res.status(400).json({ status: false, message: 'Author name required' });
        }

        const books = await db.getBooks();
        const authorBooks = books.filter(book => book.author === author);
        
        // Sort by date_added descending
        authorBooks.sort((a, b) => new Date(b.date_added) - new Date(a.date_added));

        // Apply pagination
        const offset = (page - 1) * limit;
        const paginatedBooks = authorBooks.slice(offset, offset + parseInt(limit));
        const total = authorBooks.length;

        res.json({
            status: true,
            author: author,
            data: paginatedBooks,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get author books error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch books by author' });
    }
};

// Get books grouped by author
exports.getBooksByAuthorGrouped = async (req, res) => {
    try {
        const books = await db.getBooks();
        const groupedData = {};

        books.forEach(book => {
            if (!groupedData[book.author]) {
                groupedData[book.author] = {
                    author: book.author,
                    book_count: 0,
                    titles: []
                };
            }
            groupedData[book.author].book_count++;
            groupedData[book.author].titles.push(book.bookname);
        });

        const result = Object.values(groupedData).sort((a, b) => a.author.localeCompare(b.author));

        res.json({
            status: true,
            data: result
        });
    } catch (error) {
        console.error('Get grouped error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch grouped books' });
    }
};

// Get author statistics
exports.getAuthorStats = async (req, res) => {
    try {
        const books = await db.getBooks();
        const authorStats = {};

        books.forEach(book => {
            if (!authorStats[book.author]) {
                authorStats[book.author] = {
                    author: book.author,
                    total_books: 0,
                    total_price: 0,
                    total_quantity: 0,
                    min_price: book.price,
                    max_price: book.price
                };
            }
            
            const stats = authorStats[book.author];
            stats.total_books++;
            stats.total_price += book.price;
            stats.total_quantity += book.quantity;
            stats.min_price = Math.min(stats.min_price, book.price);
            stats.max_price = Math.max(stats.max_price, book.price);
        });

        // Calculate average price and format
        const result = Object.values(authorStats).map(stats => ({
            ...stats,
            avg_price: stats.total_price / stats.total_books
        })).sort((a, b) => b.total_books - a.total_books);

        res.json({
            status: true,
            data: result
        });
    } catch (error) {
        console.error('Get author stats error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch author statistics' });
    }
};
