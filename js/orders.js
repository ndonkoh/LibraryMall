/**
 * Orders and Cart Functions
 */

// Create order
async function createOrder(orderType = 'buy') {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showToast('Cart is empty', 'error');
        return;
    }

    const items = cart.filter(item => !orderType || item.type === orderType);
    
    if (items.length === 0) {
        showToast(`No ${orderType} items in cart`, 'error');
        return;
    }

    const response = await apiCall('/orders', 'POST', {
        order_type: orderType,
        items: items.map(item => ({
            book_id: item.book_id,
            quantity: item.quantity
        }))
    });

    if (response.status) {
        // Remove purchased items from cart
        const remainingCart = cart.filter(item => !items.includes(item));
        localStorage.setItem('cart', JSON.stringify(remainingCart));
        
        showToast(`Order placed successfully! Order #${response.order_id}`, 'success');
        setTimeout(() => {
            window.location.href = '/homepage.html';
        }, 2000);
    } else {
        showToast(response.message, 'error');
    }
}

// Get user orders
async function getUserOrders(page = 1, limit = 10) {
    if (!isLoggedIn()) {
        return { status: false, message: 'Not logged in' };
    }

    return await apiCall(`/orders/user/my-orders?page=${page}&limit=${limit}`);
}

// Get order by ID
async function getOrder(orderId) {
    return await apiCall(`/orders/${orderId}`);
}

// Display user orders
async function displayUserOrders() {
    const response = await getUserOrders();

    if (!response.status) {
        showToast('Failed to load orders', 'error');
        return;
    }

    const ordersContainer = document.querySelector('.orders-container');
    if (!ordersContainer) return;

    ordersContainer.innerHTML = '';

    if (response.data.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No orders yet</p>';
        return;
    }

    response.data.forEach(order => {
        const orderHTML = `
            <div style="border: 1px solid #e0ddd6; border-radius: 10px; padding: 20px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3>Order #${order.order_id}</h3>
                    <span style="padding: 5px 15px; border-radius: 20px; background: ${order.status === 'completed' ? '#4caf82' : order.status === 'pending' ? '#e8c96d' : '#e05252'}; color: white; font-size: 12px;">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>
                <p><strong>Type:</strong> ${order.order_type === 'buy' ? 'Purchase' : 'Loan'}</p>
                <p><strong>Date:</strong> ${formatDate(order.order_date)}</p>
                <p><strong>Amount:</strong> ${formatCurrency(order.amount)}</p>
                <p style="font-size: 12px; color: #7a7a7a; margin-top: 10px;">
                    <strong>Items:</strong> ${order.items ? order.items.map(item => item.bookname).join(', ') : 'N/A'}
                </p>
            </div>
        `;
        ordersContainer.innerHTML += orderHTML;
    });
}

// Get cart from localStorage
function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

// Display cart
function displayCart() {
    const cart = getCart();
    const cartContainer = document.querySelector('.cart-container');
    
    if (!cartContainer) return;

    cartContainer.innerHTML = '';

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Your cart is empty</p>';
        return;
    }

    let total = 0;
    let totalItems = 0;

    cart.forEach((item, index) => {
        // Get book details
        getBookById(item.book_id).then(response => {
            if (response.status) {
                const book = response.data;
                const itemTotal = book.price * item.quantity;
                total += itemTotal;
                totalItems += item.quantity;

                const cartItemHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e0ddd6; border-radius: 8px; margin-bottom: 10px;">
                        <div>
                            <p style="font-weight: 600; margin: 0;">${book.bookname}</p>
                            <p style="color: #7a7a7a; font-size: 12px; margin: 5px 0;">${book.author}</p>
                            <p style="margin: 5px 0;">Qty: <input type="number" value="${item.quantity}" min="1" onchange="updateCartItem(${item.book_id}, this.value)" style="width: 50px; padding: 5px;"></p>
                        </div>
                        <div style="text-align: right;">
                            <p style="font-weight: 600; margin: 0;">${formatCurrency(itemTotal)}</p>
                            <button onclick="removeFromCart(${item.book_id})" style="margin-top: 10px; padding: 5px 15px; background: #e05252; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Remove</button>
                        </div>
                    </div>
                `;
                cartContainer.innerHTML += cartItemHTML;
            }
        });
    });

    // Add checkout button
    setTimeout(() => {
        if (cartContainer.querySelector('button') === null && cart.length > 0) {
            const checkoutHTML = `
                <div style="margin-top: 20px; text-align: right;">
                    <p style="font-size: 18px; font-weight: 700; margin-bottom: 10px;">Total: <span id="cartTotal">${formatCurrency(total)}</span></p>
                    <button onclick="createOrder('buy')" style="padding: 12px 30px; background: #1a3c34; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Checkout
                    </button>
                </div>
            `;
            cartContainer.innerHTML += checkoutHTML;
        }
    }, 500);
}

// Update cart item quantity
function updateCartItem(bookId, quantity) {
    const cart = getCart();
    const item = cart.find(i => i.book_id === bookId);

    if (item) {
        item.quantity = parseInt(quantity);
        if (item.quantity <= 0) {
            removeFromCart(bookId);
        } else {
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        }
    }
}

// Remove from cart
function removeFromCart(bookId) {
    let cart = getCart();
    cart = cart.filter(item => item.book_id !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    showToast('Item removed from cart', 'success');
    displayCart();
}

// Clear cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem('cart');
        displayCart();
        showToast('Cart cleared', 'success');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.orders-container')) {
        displayUserOrders();
    }
    if (document.querySelector('.cart-container')) {
        displayCart();
    }
});
