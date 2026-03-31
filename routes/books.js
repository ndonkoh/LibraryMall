const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.get('/all', bookController.getAllBooks);
router.get('/search', bookController.searchBooks);
router.get('/authors/all', bookController.getAllAuthors);
router.get('/authors/stats', bookController.getAuthorStats);
router.get('/authors/grouped', bookController.getBooksByAuthorGrouped);
router.get('/authors/:author', bookController.getByAuthor);
router.get('/:id', bookController.getBookById);
router.get('/category/:category', bookController.getByCategory);

// Admin routes
router.post('/', authenticateToken, authorizeAdmin, bookController.createBook);
router.put('/:id', authenticateToken, authorizeAdmin, bookController.updateBook);
router.delete('/:id', authenticateToken, authorizeAdmin, bookController.deleteBook);
router.get('/admin/stats', authenticateToken, authorizeAdmin, bookController.getBookStats);

module.exports = router;
