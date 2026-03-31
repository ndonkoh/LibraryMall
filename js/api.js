/**
 * API Configuration and Helper Functions
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Store token in localStorage
function setToken(token) {
    localStorage.setItem('authToken', token);
}

// Get stored token
function getToken() {
    return localStorage.getItem('authToken');
}

// Remove token on logout
function removeToken() {
    localStorage.removeItem('authToken');
}

// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Get authorization headers
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json'
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// Make API call
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: getHeaders()
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        // Handle unauthorized (token expired)
        if (response.status === 401) {
            removeToken();
            redirectToLogin();
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        return { status: false, message: error.message };
    }
}

// Redirect to login
function redirectToLogin() {
    window.location.href = '/login.html';
}

// Show toast/notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        background: ${type === 'error' ? '#e05252' : type === 'success' ? '#4caf82' : '#1a3c34'};
        color: white;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}
