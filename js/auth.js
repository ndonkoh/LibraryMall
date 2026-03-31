/**
 * Authentication Functions
 */

// Login handler
async function handleLogin(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const email = form?.querySelector('input[name="email"]')?.value.trim();
    const password = form?.querySelector('input[name="password"]')?.value;

    if (!email || !password) {
        showToast('Email and password required', 'error');
        return;
    }

    const response = await apiCall('/auth/login', 'POST', { email, password });

    if (response.status) {
        setToken(response.token);
        showToast(response.message, 'success');
        setTimeout(() => {
            window.location.href = '/homepage.html';
        }, 1000);
    } else {
        showToast(response.message, 'error');
    }
}

// Signup handler
async function handleSignup(event) {
    event.preventDefault();

    const username = document.querySelector('input[placeholder="Full name"]')?.value;
    const email = document.querySelector('input[type="email"]')?.value;
    const password = document.querySelector('input[placeholder="Password"]')?.value;
    const confirmPassword = document.querySelector('input[placeholder="Confirm password"]')?.value;

    if (!username || !email || !password || !confirmPassword) {
        showToast('All fields are required', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }

    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'error');
        return;
    }

    const response = await apiCall('/auth/register', 'POST', {
        username,
        email,
        password
    });

    if (response.status) {
        showToast('Registration successful. Redirecting to login...', 'success');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    } else {
        showToast(response.message, 'error');
    }
}

// Logout handler
function handleLogout() {
    removeToken();
    showToast('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 500);
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.querySelector('input[type="password"]');
    const eyeButton = document.querySelector('.eye');

    if (passwordInput) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            eyeButton.textContent = '👁️‍🗨️';
        } else {
            passwordInput.type = 'password';
            eyeButton.textContent = '👁';
        }
    }
}

// Get current user info
async function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }

    const response = await apiCall('/auth/profile', 'GET');
    return response.status ? response.data : null;
}

// Update user profile
async function updateUserProfile(username, phone) {
    const response = await apiCall('/auth/profile', 'PUT', { username, phone });
    return response;
}

// Change password
async function changePassword(currentPassword, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
        return { status: false, message: 'Passwords do not match' };
    }

    return await apiCall('/auth/change-password', 'POST', {
        currentPassword,
        newPassword
    });
}

// Protect page - redirect if not logged in
function protectPage() {
    if (!isLoggedIn()) {
        redirectToLogin();
    }
}

// Protect admin page - redirect if not admin
async function protectAdminPage() {
    if (!isLoggedIn()) {
        redirectToLogin();
        return;
    }

    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = '/homepage.html';
    }
}

// Initialize auth UI
async function initAuthUI() {
    const token = getToken();
    const navRight = document.querySelector('.nav-right') || document.querySelector('.topbar-right');

    if (navRight && token) {
        const pageName = (window.location.pathname || '').split('/').pop();
        const disableProfileMenu =
            pageName === 'discover.html' ||
            pageName === 'discover' ||
            pageName === 'bookmark.html' ||
            pageName === 'bookmark';
        const user = await getCurrentUser();
        if (user) {
            // Show user menu instead of login/signup
            // Special case: on discover page, clicking profile should do nothing (no logout dropdown)
            if (disableProfileMenu) {
                navRight.innerHTML = `
                    <div class="user-menu">
                        <span class="avatar-btn">${user.username.substring(0, 2).toUpperCase()}</span>
                    </div>
                `;
            } else {
                navRight.innerHTML = `
                    <div class="user-menu">
                        <span class="avatar-btn">${user.username.substring(0, 2).toUpperCase()}</span>
                        <div class="dropdown-menu" style="display:none;">
                            <a href="#" onclick="handleLogout()">Logout</a>
                        </div>
                    </div>
                `;

                // Add click handler to show dropdown
                const avatar = navRight.querySelector('.avatar-btn');
                if (avatar) {
                    avatar.addEventListener('click', (e) => {
                        e.preventDefault();
                        const menu = navRight.querySelector('.dropdown-menu');
                        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
                    });
                }
            }
        }
    }
}

// Call on page load
document.addEventListener('DOMContentLoaded', initAuthUI);
