/**
 * Book Management Functions
 */

// Get all books
async function getAllBooks(category = 'all', page = 1, limit = 12) {
    let endpoint = `/books/all?page=${page}&limit=${limit}`;
    if (category && category !== 'all') {
        endpoint += `&category=${category}`;
    }

    return await apiCall(endpoint);
}

// Get all authors from database
async function getAllAuthors() {
    return await apiCall('/books/authors/all');
}

// Get books by author
async function getBooksByAuthor(author, page = 1, limit = 12) {
    const endpoint = `/books/authors/${encodeURIComponent(author)}?page=${page}&limit=${limit}`;
    return await apiCall(endpoint);
}

// Get books grouped by author
async function getBooksGroupedByAuthor() {
    return await apiCall('/books/authors/grouped');
}

// Get author statistics
async function getAuthorStats() {
    return await apiCall('/books/authors/stats');
}

// Get book by ID
async function getBookById(bookId) {
    const response = await apiCall(`/books/${bookId}`);
    return response;
}

// Search books
async function searchBooks(query, limit = 20) {
    const response = await apiCall(`/books/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    return response;
}

// Display books grid
async function displayBooks(category = 'all', page = 1) {
    const response = await getAllBooks(category, page);

    if (!response.status) {
        showToast('Failed to load books', 'error');
        return;
    }

    const bookGrid = document.querySelector('.book-grid') || document.querySelector('.book-list');
    if (!bookGrid) return;

    bookGrid.innerHTML = '';

    if (response.data.length === 0) {
        bookGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No books found</p>';
        return;
    }

    response.data.forEach(book => {
        const bookHTML = `
            <div class="book-tile" onclick="viewBook(${book.book_id})">
                <div class="cover-block" style="background: linear-gradient(160deg, #1a1a2e, #e94560); cursor: pointer;">
                    <div class="ct">${book.bookname.substring(0, 20)}</div>
                    <div class="ca">${book.author}</div>
                </div>
                <div class="book-info">
                    <div class="book-title">${book.bookname}</div>
                    <div class="book-author">${book.author}</div>
                    <div class="book-price">${formatCurrency(book.price)}</div>
                    <div style="font-size: 12px; color: #7a7a7a; margin-top: 5px;">
                        ${book.quantity > 0 ? `${book.quantity} available` : 'Out of stock'}
                    </div>
                </div>
            </div>
        `;
        bookGrid.innerHTML += bookHTML;
    });

    // Update pagination if exists
    updatePagination(response.pagination, category);
}

// Display authors list as filter buttons
async function displayAuthorFilters() {
    const response = await getAllAuthors();

    if (!response.status) {
        console.error('Failed to load authors:', response);
        return;
    }

    const authorsContainer = document.querySelector('[data-authors-filter]');
    if (!authorsContainer) {
        console.error('Authors container not found');
        return;
    }

    authorsContainer.innerHTML = '';
    
    // Add "All Authors" button
    const allBtn = document.createElement('button');
    allBtn.className = 'pill active';
    allBtn.textContent = 'All Authors';
    allBtn.onclick = (e) => setAuthorFilterButton(e, null);
    authorsContainer.appendChild(allBtn);

    // Add individual author buttons
    response.data.forEach(author => {
        const btn = document.createElement('button');
        btn.className = 'pill';
        btn.textContent = author;
        btn.onclick = (e) => setAuthorFilterButton(e, author);
        authorsContainer.appendChild(btn);
    });
}

// Set author filter and display books
async function setAuthorFilterButton(event, author) {
    const button = event.target;
    
    // Update active button
    document.querySelectorAll('[data-authors-filter] .pill').forEach(pill => {
        pill.classList.remove('active');
    });
    button.classList.add('active');
    
    // Load books for selected author
    if (author === null) {
        displayBooks('all', 1);
    } else {
        displayBooksByAuthor(author, 1);
    }
}

// Display books filtered by author
async function displayBooksByAuthor(author, page = 1) {
    const response = await getBooksByAuthor(author, page);

    if (!response.status) {
        showToast('Failed to load books', 'error');
        return;
    }

    const bookGrid = document.querySelector('.book-grid') || document.querySelector('.book-list');
    if (!bookGrid) return;

    bookGrid.innerHTML = '';

    if (response.data.length === 0) {
        bookGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 40px;">No books found by ${author}</p>`;
        return;
    }

    response.data.forEach(book => {
        const bookHTML = `
            <div class="book-tile" onclick="viewBook(${book.book_id})">
                <div class="cover-block" style="background: linear-gradient(160deg, #1a1a2e, #e94560); cursor: pointer;">
                    <div class="ct">${book.bookname.substring(0, 20)}</div>
                    <div class="ca">${book.author}</div>
                </div>
                <div class="book-info">
                    <div class="book-title">${book.bookname}</div>
                    <div class="book-author">${book.author}</div>
                    <div class="book-price">${formatCurrency(book.price)}</div>
                    <div style="font-size: 12px; color: #7a7a7a; margin-top: 5px;">
                        ${book.quantity > 0 ? `${book.quantity} available` : 'Out of stock'}
                    </div>
                </div>
            </div>
        `;
        bookGrid.innerHTML += bookHTML;
    });

    // Update pagination
    updatePagination(response.pagination, 'author', author);
}

// View book details
async function viewBook(bookId) {
    const response = await getBookById(bookId);

    if (!response.status) {
        showToast('Book not found', 'error');
        return;
    }

    const book = response.data;
    const modal = document.createElement('div');
    modal.className = 'book-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 14px; max-width: 500px; width: 90%;">
            <button onclick="this.closest('.book-modal').remove()" style="float: right; border: none; background: none; font-size: 24px; cursor: pointer;">×</button>
            <h2>${book.bookname}</h2>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Category:</strong> ${book.category}</p>
            <p><strong>Price:</strong> ${formatCurrency(book.price)}</p>
            <p><strong>Available:</strong> ${book.quantity}</p>
            <div style="margin-top: 20px; display: flex; gap: 10px;">
                ${book.quantity > 0 ? `
                    <button onclick="addToCart(${book.book_id})" style="flex: 1; padding: 10px; background: #1a3c34; color: white; border: none; border-radius: 8px; cursor: pointer;">Buy</button>
                    <button onclick="borrowBook(${book.book_id})" style="flex: 1; padding: 10px; background: #4caf82; color: white; border: none; border-radius: 8px; cursor: pointer;">Borrow</button>
                ` : `
                    <button disabled style="flex: 1; padding: 10px; background: #ccc; color: #666; border: none; border-radius: 8px; cursor: not-allowed;">Out of Stock</button>
                `}
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Add book to cart
async function addToCart(bookId) {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.book_id === bookId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ book_id: bookId, quantity: 1, type: 'buy' });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    showToast('Added to cart', 'success');
    document.querySelector('.book-modal')?.remove();
}

// Borrow book
async function borrowBook(bookId) {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }

    if (!confirm('Do you want to borrow this book?')) {
        return;
    }

    const response = await apiCall('/orders', 'POST', {
        order_type: 'loan',
        items: [{ book_id: bookId, quantity: 1 }]
    });

    if (response.status) {
        showToast('Book borrowed successfully!', 'success');
        document.querySelector('.book-modal')?.remove();
    } else {
        showToast(response.message, 'error');
    }
}

// Search and filter
function setupSearch() {
    const searchInput = document.querySelector('.search-bar input') || document.querySelector('#bmSearch');
    
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();
            
            if (query.length === 0) {
                displayBooks('all', 1);
                return;
            }

            if (query.length < 2) {
                return;
            }

            const response = await searchBooks(query);
            if (response.status) {
                const bookGrid = document.querySelector('.book-grid') || document.querySelector('.book-list');
                bookGrid.innerHTML = '';

                response.data.forEach(book => {
                    const bookHTML = `
                        <div class="book-tile" onclick="viewBook(${book.book_id})" style="cursor: pointer;">
                            <div class="cover-block" style="background: linear-gradient(160deg, #1a1a2e, #e94560);">
                                <div class="ct">${book.bookname.substring(0, 20)}</div>
                                <div class="ca">${book.author}</div>
                            </div>
                            <div class="book-info">
                                <div class="book-title">${book.bookname}</div>
                                <div class="book-author">${book.author}</div>
                            </div>
                        </div>
                    `;
                    bookGrid.innerHTML += bookHTML;
                });
            }
        });
    }
}

// Set active pill/filter
function setPill(element) {
    document.querySelectorAll('.pill').forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');

    const categoryMap = {
        'Popular': 'all',
        'Top Selling': 'all',
        'Following': 'all',
        'New': 'all'
    };

    displayBooks(categoryMap[element.textContent] || 'all', 1);
}

// Update pagination
function updatePagination(pagination, filterType, filterValue = null) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer || !pagination) return;

    paginationContainer.innerHTML = '';

    for (let i = 1; i <= pagination.pages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === pagination.page ? 'active' : '';
        
        if (filterType === 'author' && filterValue) {
            btn.onclick = () => displayBooksByAuthor(filterValue, i);
        } else {
            btn.onclick = () => displayBooks(filterType, i);
        }
        
        paginationContainer.appendChild(btn);
    }
}

// Initialize books page
document.addEventListener('DOMContentLoaded', async () => {
    if (document.querySelector('.book-grid') || document.querySelector('.book-list')) {
        await displayBooks('all', 1);
        setupSearch();
    }
    
    // Load author filters if container exists
    if (document.querySelector('[data-authors-filter]')) {
        await displayAuthorFilters();
    }
});
