/**
 * Admin Dashboard Functions
 */

// Section switching functionality
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.style.display = 'block';
        selectedSection.classList.add('active');
    }

    // Update sidebar active state
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to clicked item
    const clickedItem = document.querySelector(`[data-section="${sectionId}"]`);
    if (clickedItem) {
        clickedItem.classList.add('active');
    }
}

// Initialize sidebar navigation
function initializeSidebar() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        // Add data-section attributes to match sections
        const text = item.textContent.trim();
        let sectionId = '';
        
        switch(text) {
            case 'Dashboard':
                sectionId = 'dashboardSection';
                break;
            case 'Books':
                sectionId = 'booksSection';
                break;
            case 'Borrowers':
                sectionId = 'borrowersSection';
                break;
            case 'Loan History':
                sectionId = 'loanHistorySection';
                break;
            case 'Overdue':
                sectionId = 'overdueSection';
                break;
            case 'Reports':
                sectionId = 'reportsSection';
                break;
            case 'Settings':
                sectionId = 'settingsSection';
                break;
        }
        
        if (sectionId) {
            item.setAttribute('data-section', sectionId);
            item.addEventListener('click', (e) => {
                e.preventDefault();
                showSection(sectionId);
                loadSectionData(sectionId);
            });
        }
    });
}

// Load data for specific sections
async function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'booksSection':
            await loadBooksManagement();
            break;
        case 'borrowersSection':
            await loadAllBorrowers();
            break;
        case 'loanHistorySection':
            await loadLoanHistory();
            break;
        case 'overdueSection':
            await loadOverdueItems();
            break;
        case 'reportsSection':
            await loadReports();
            break;
        case 'settingsSection':
            // Settings page - no data loading needed yet
            break;
    }
}

// Load books management data
async function loadBooksManagement() {
    try {
        const response = await apiCall('/books');
        if (response.status && response.data) {
            const booksTableBody = document.getElementById('booksTableBody');
            if (booksTableBody) {
                booksTableBody.innerHTML = response.data.map(book => `
                    <tr>
                        <td>${book.book_id}</td>
                        <td>${book.bookname}</td>
                        <td>${book.author}</td>
                        <td>${formatCurrency(book.price)}</td>
                        <td>${book.quantity}</td>
                        <td>${book.category}</td>
                        <td>
                            <button onclick="editBook(${book.book_id})" style="padding: 5px 10px; background: #1a3c34; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 5px;">Edit</button>
                            <button onclick="deleteBook(${book.book_id})" style="padding: 5px 10px; background: #e05252; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Delete</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading books:', error);
        showToast('Error loading books', 'error');
    }
}

// Load all borrowers
async function loadAllBorrowers() {
    try {
        const ordersResponse = await apiCall('/orders/admin/all');
        const orders = ordersResponse.data || [];
        
        const borrowersMap = new Map();
        
        orders.forEach(order => {
            if (order.status === 'completed') {
                if (!borrowersMap.has(order.userid)) {
                    borrowersMap.set(order.userid, {
                        userid: order.userid,
                        username: order.username || 'User ' + order.userid,
                        email: order.email || 'user' + order.userid + '@email.com',
                        totalOrders: 0,
                        booksBorrowed: 0,
                        booksPurchased: 0,
                        lastOrderDate: order.order_date
                    });
                }
                
                const borrower = borrowersMap.get(order.userid);
                borrower.totalOrders++;
                
                if (order.order_type === 'loan') {
                    borrower.booksBorrowed += order.items.reduce((sum, item) => sum + item.quantity, 0);
                } else if (order.order_type === 'buy') {
                    borrower.booksPurchased += order.items.reduce((sum, item) => sum + item.quantity, 0);
                }
            }
        });
        
        const borrowers = Array.from(borrowersMap.values());
        const allBorrowersContainer = document.getElementById('allBorrowersList');
        
        if (allBorrowersContainer) {
            allBorrowersContainer.innerHTML = borrowers.map(borrower => `
                <div class="borrower-card">
                    <div class="avatar" style="background: var(--blue-mid);">${borrower.username.charAt(0).toUpperCase()}</div>
                    <div class="borrower-info">
                        <div class="name">${borrower.username}</div>
                        <div class="email">${borrower.email}</div>
                        <div class="meta">Total Orders: <span>${borrower.totalOrders}</span></div>
                        <div class="meta">Books Borrowed: <span>${borrower.booksBorrowed}</span></div>
                        <div class="meta">Books Purchased: <span>${borrower.booksPurchased}</span></div>
                        <div class="meta">Last Active: <span>${new Date(borrower.lastOrderDate).toLocaleDateString()}</span></div>
                    </div>
                    <button class="view-btn">View ›</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading borrowers:', error);
    }
}

// Load loan history
async function loadLoanHistory() {
    try {
        const response = await apiCall('/orders/admin/all');
        const orders = response.data || [];
        
        const loanOrders = orders.filter(order => order.order_type === 'loan');
        const loanHistoryContainer = document.getElementById('loanHistoryList');
        
        if (loanHistoryContainer) {
            if (loanOrders.length === 0) {
                loanHistoryContainer.innerHTML = '<p style="padding: 20px; text-align: center;">No loan history found</p>';
            } else {
                loanHistoryContainer.innerHTML = loanOrders.map(order => `
                    <div style="padding: 15px; border: 1px solid var(--border); border-radius: 10px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div>
                                <p style="font-weight: 600; margin: 0;">Order #${order.order_id}</p>
                                <p style="color: var(--muted); font-size: 12px; margin: 5px 0;">${order.username || 'User ' + order.userid} | ${formatDate(order.order_date)}</p>
                            </div>
                            <span style="padding: 5px 15px; border-radius: 20px; background: #4caf82; color: white; font-size: 12px;">
                                ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                        </div>
                        <p style="margin: 5px 0;"><strong>Books:</strong></p>
                        <ul style="margin: 5px 0; padding-left: 20px;">
                            ${order.items.map(item => `<li>${item.book ? item.book.bookname : 'Book ID ' + item.book_id} (${item.quantity})</li>`).join('')}
                        </ul>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Error loading loan history:', error);
    }
}

// Load overdue items
async function loadOverdueItems() {
    try {
        const overdueContainer = document.getElementById('overdueList');
        if (overdueContainer) {
            overdueContainer.innerHTML = '<p style="padding: 20px; text-align: center;">No overdue items at this time</p>';
        }
    } catch (error) {
        console.error('Error loading overdue items:', error);
    }
}

// Load reports
async function loadReports() {
    try {
        // Load category statistics
        const booksResponse = await apiCall('/books');
        const books = booksResponse.data || [];
        
        const categoryStats = {};
        books.forEach(book => {
            categoryStats[book.category] = (categoryStats[book.category] || 0) + 1;
        });
        
        const categoryContainer = document.getElementById('categoryStats');
        if (categoryContainer) {
            categoryContainer.innerHTML = Object.entries(categoryStats)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0ddd6;">
                        <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <span style="font-weight: 600;">${count} books</span>
                    </div>
                `).join('');
        }
        
        // Load author statistics
        const authorStats = {};
        books.forEach(book => {
            authorStats[book.author] = (authorStats[book.author] || 0) + 1;
        });
        
        const authorContainer = document.getElementById('authorStats');
        if (authorContainer) {
            authorContainer.innerHTML = Object.entries(authorStats)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([author, count]) => `
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0ddd6;">
                        <span>${author}</span>
                        <span style="font-weight: 600;">${count} books</span>
                    </div>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading reports:', error);
    }
}

// Show/hide add book form
function showAddBookForm() {
    const form = document.getElementById('addBookForm');
    if (form) {
        form.style.display = 'block';
    }
}

function hideAddBookForm() {
    const form = document.getElementById('addBookForm');
    if (form) {
        form.style.display = 'none';
        document.getElementById('newBookForm').reset();
    }
}

// Get dashboard stats
async function getDashboardStats() {
    try {
        const bookStatsResponse = await apiCall('/books/admin/stats');
        const orderStatsResponse = await apiCall('/orders/admin/stats');

        return {
            books: bookStatsResponse.data || {},
            orders: orderStatsResponse.data || {}
        };
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        return {
            books: {},
            orders: {}
        };
    }
}

// Display dashboard stats
async function displayDashboardStats() {
    try {
        const stats = await getDashboardStats();

        const statsGrid = document.querySelector('.stats-grid');
        if (!statsGrid) return;

        statsGrid.innerHTML = `
            <div class="stat-card">
                <div class="icon">📚</div>
                <div class="label">Total Books</div>
                <div class="value">${stats.books.total_books || 0}</div>
            </div>
            <div class="stat-card">
                <div class="icon">✓</div>
                <div class="label">Available</div>
                <div class="value">${stats.books.available_books || 0}</div>
            </div>
            <div class="stat-card">
                <div class="icon">💰</div>
                <div class="label">Revenue</div>
                <div class="value">${formatCurrency(stats.orders.total_revenue || 0)}</div>
            </div>
            <div class="stat-card">
                <div class="icon">📋</div>
                <div class="label">Pending</div>
                <div class="value">${stats.orders.pending_orders || 0}</div>
            </div>
        `;
    } catch (error) {
        console.error('Error displaying dashboard stats:', error);
    }
}

// Get all orders (Admin)
async function getAllOrders(status = null, page = 1, limit = 20) {
    let endpoint = `/orders/admin/all?page=${page}&limit=${limit}`;
    if (status) {
        endpoint += `&status=${status}`;
    }

    return await apiCall(endpoint);
}

// Display pending orders
async function displayPendingOrders() {
    const response = await getAllOrders('pending', 1, 50);

    if (!response.status) {
        showToast('Failed to load orders', 'error');
        return;
    }

    const ordersContainer = document.querySelector('.orders-list');
    if (!ordersContainer) return;

    ordersContainer.innerHTML = '';

    if (response.data.length === 0) {
        ordersContainer.innerHTML = '<p style="padding: 20px; text-align: center;">No pending orders</p>';
        return;
    }

    response.data.forEach(order => {
        const statusColor = order.status === 'completed' ? '#4caf82' : order.status === 'pending' ? '#e8c96d' : '#e05252';
        const orderHTML = `
            <div style="padding: 15px; border: 1px solid #e0ddd6; border-radius: 10px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <p style="font-weight: 600; margin: 0;">Order #${order.order_id}</p>
                        <p style="color: #7a7a7a; font-size: 12px; margin: 5px 0;">${order.username} | ${formatDate(order.order_date)}</p>
                    </div>
                    <span style="padding: 5px 15px; border-radius: 20px; background: ${statusColor}; color: white; font-size: 12px;">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
                <p style="margin: 5px 0;"><strong>Type:</strong> ${order.order_type === 'buy' ? 'Purchase' : 'Loan'}</p>
                <p style="margin: 5px 0;"><strong>Amount:</strong> ${formatCurrency(order.amount)}</p>
                <div style="margin-top: 10px; display: flex; gap: 10px;">
                    <button onclick="updateOrderStatus(${order.order_id}, 'approved')" style="flex: 1; padding: 8px; background: #4caf82; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Approve</button>
                    <button onclick="updateOrderStatus(${order.order_id}, 'rejected')" style="flex: 1; padding: 8px; background: #e05252; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Reject</button>
                </div>
            </div>
        `;
        ordersContainer.innerHTML += orderHTML;
    });
}

// Update order status
async function updateOrderStatus(orderId, status) {
    const response = await apiCall(`/orders/${orderId}/status`, 'PUT', { status });

    if (response.status) {
        showToast('Order updated successfully', 'success');
        displayPendingOrders();
    } else {
        showToast(response.message, 'error');
    }
}

// Get all books (Admin)
async function getAllBooksAdmin(page = 1, limit = 20) {
    return await apiCall(`/books/all?page=${page}&limit=${limit}`);
}

// Display books management
async function displayBooksManagement() {
    const response = await getAllBooksAdmin();

    if (!response.status) {
        showToast('Failed to load books', 'error');
        return;
    }

    const booksTable = document.querySelector('.books-table thead');
    if (!booksTable) return;

    const tableBody = document.querySelector('.books-table tbody');
    tableBody.innerHTML = '';

    response.data.forEach(book => {
        const row = `
            <tr>
                <td>${book.book_id}</td>
                <td>${book.bookname}</td>
                <td>${book.author}</td>
                <td>${formatCurrency(book.price)}</td>
                <td>${book.quantity}</td>
                <td>${book.category}</td>
                <td>
                    <button onclick="editBook(${book.book_id})" style="padding: 5px 10px; background: #1a3c34; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; margin-right: 5px;">Edit</button>
                    <button onclick="deleteBook(${book.book_id})" style="padding: 5px 10px; background: #e05252; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Delete</button>
                </td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// Add new book
async function addNewBook(event) {
    event.preventDefault();

    const bookname = document.querySelector('input[name="bookname"]')?.value;
    const author = document.querySelector('input[name="author"]')?.value;
    const price = document.querySelector('input[name="price"]')?.value;
    const category = document.querySelector('select[name="category"]')?.value;
    const quantity = document.querySelector('input[name="quantity"]')?.value;

    if (!bookname || !author || !price || !category) {
        showToast('All fields are required', 'error');
        return;
    }

    const response = await apiCall('/books', 'POST', {
        bookname,
        author,
        price: parseFloat(price),
        category,
        quantity: parseInt(quantity) || 0
    });

    if (response.status) {
        showToast('Book added successfully', 'success');
        hideAddBookForm();
        await loadBooksManagement(); // Refresh the books table
    } else {
        showToast(response.message, 'error');
    }
}

// Edit book function
async function editBook(bookId) {
    try {
        const response = await apiCall(`/books/${bookId}`);
        
        if (!response.status) {
            showToast('Failed to load book data', 'error');
            return;
        }

        const book = response.data;
        
        // Hide add form if it's open
        hideAddBookForm();
        
        // Populate edit form
        document.getElementById('editBookId').value = book.book_id;
        document.getElementById('editBookName').value = book.bookname;
        document.getElementById('editBookAuthor').value = book.author;
        document.getElementById('editBookPrice').value = book.price;
        document.getElementById('editBookCategory').value = book.category;
        document.getElementById('editBookQuantity').value = book.quantity;
        
        // Show edit form
        const editForm = document.getElementById('editBookForm');
        editForm.style.display = 'block';
        
        // Scroll to form
        editForm.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error loading book for edit:', error);
        showToast('Error loading book data', 'error');
    }
}

// Update book function
async function updateBook(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const bookId = formData.get('bookId');
        
        const updateData = {
            bookname: formData.get('bookname'),
            author: formData.get('author'),
            price: parseFloat(formData.get('price')),
            category: formData.get('category'),
            quantity: parseInt(formData.get('quantity'))
        };
        
        const response = await apiCall(`/books/${bookId}`, 'PUT', updateData);
        
        if (response.status) {
            showToast('Book updated successfully', 'success');
            hideEditBookForm();
            await loadBooksManagement(); // Refresh the books table
        } else {
            showToast(response.message || 'Failed to update book', 'error');
        }
    } catch (error) {
        console.error('Error updating book:', error);
        showToast('Error updating book', 'error');
    }
}

// Delete book function
async function deleteBook(bookId) {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this book? This action cannot be undone.');
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await apiCall(`/books/${bookId}`, 'DELETE');
        
        if (response.status) {
            showToast('Book deleted successfully', 'success');
            await loadBooksManagement(); // Refresh the books table
        } else {
            showToast(response.message || 'Failed to delete book', 'error');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        showToast('Error deleting book', 'error');
    }
}

// Hide edit book form
function hideEditBookForm() {
    const form = document.getElementById('editBookForm');
    if (form) {
        form.style.display = 'none';
        document.getElementById('updateBookForm').reset();
    }
}

// Display most borrowed books
async function displayMostBorrowedBooks() {
    try {
        const ordersResponse = await apiCall('/orders/admin/all');
        const orders = ordersResponse.data || [];
        
        // Count book borrow frequency
        const bookCounts = {};
        orders.forEach(order => {
            if (order.status === 'completed' && order.order_type === 'loan') {
                order.items.forEach(item => {
                    bookCounts[item.book_id] = (bookCounts[item.book_id] || 0) + item.quantity;
                });
            }
        });
        
        // Sort by frequency and get top 5
        const sortedBooks = Object.entries(bookCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        // Get book details - first try from orders, then fallback to API call
        const mostBorrowedContainer = document.getElementById('mostBorrowedBooks');
        if (!mostBorrowedContainer) return;
        
        if (sortedBooks.length === 0) {
            mostBorrowedContainer.innerHTML = '<p style="color: var(--muted); font-size: 12px;">No books borrowed yet</p>';
            return;
        }
        
        // Try to get book names from orders first
        const bookNames = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.book && item.book.bookname) {
                    bookNames[item.book_id] = item.book.bookname;
                }
            });
        });
        
        mostBorrowedContainer.innerHTML = sortedBooks.map(([bookId, count], index) => {
            const bookName = bookNames[bookId] || `Book ID ${bookId}`;
            return `<div class="book-thumb b${index + 1}">
                <span class="spine-text">${bookName.length > 15 ? bookName.substring(0, 15) + '...' : bookName}</span>
            </div>`;
        }).join('');
        
    } catch (error) {
        console.error('Error loading most borrowed books:', error);
    }
}

// Display borrowers
async function displayBorrowers() {
    try {
        const ordersResponse = await apiCall('/orders/admin/all');
        const orders = ordersResponse.data || [];
        
        // Get unique users with active loans
        const borrowersMap = new Map();
        
        orders.forEach(order => {
            if (order.status === 'completed' && order.order_type === 'loan') {
                if (!borrowersMap.has(order.userid)) {
                    borrowersMap.set(order.userid, {
                        userid: order.userid,
                        username: order.username || 'User ' + order.userid,
                        email: order.email || 'user' + order.userid + '@email.com',
                        booksBorrowed: 0,
                        lastOrderDate: order.order_date
                    });
                }
                
                const borrower = borrowersMap.get(order.userid);
                borrower.booksBorrowed += order.items.reduce((sum, item) => sum + item.quantity, 0);
            }
        });
        
        const borrowers = Array.from(borrowersMap.values());
        
        const borrowersContainer = document.getElementById('borrowersList');
        if (!borrowersContainer) return;
        
        borrowersContainer.innerHTML = borrowers.slice(0, 3).map((borrower, index) => {
            const initial = borrower.username.charAt(0).toUpperCase();
            const colors = ['var(--blue-mid)', 'var(--green-mid)', 'var(--purple-mid)'];
            const bgColor = colors[index % colors.length];
            
            return `<div class="borrower-card">
                <div class="avatar" style="background: ${bgColor};">${initial}</div>
                <div class="borrower-info">
                    <div class="name">${borrower.username}</div>
                    <div class="email">${borrower.email}</div>
                    <div class="meta">Books Borrowed: <span>${borrower.booksBorrowed}</span></div>
                    <div class="meta">Last Active: <span>${new Date(borrower.lastOrderDate).toLocaleDateString()}</span></div>
                </div>
                <button class="view-btn">View ›</button>
            </div>`;
        }).join('');
        
    } catch (error) {
        console.error('Error loading borrowers:', error);
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await protectAdminPage();
    
    // Initialize sidebar navigation
    initializeSidebar();

    // Load dashboard
    await displayDashboardStats();
    await displayPendingOrders();
    await displayMostBorrowedBooks();
    await displayBorrowers();

    // Set up auto-refresh
    setInterval(displayPendingOrders, 30000); // Refresh every 30 seconds
});
