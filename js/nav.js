/**
 * Navigation Setup and Global Functions
 */

// Set up navigation links
function setupNavigation() {
    // Update active nav item based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'homepage.html';
    
    document.querySelectorAll('.nav-item').forEach(item => {
        const href = item.getAttribute('href');
        item.classList.remove('active');
        
        if (href === currentPage || (currentPage === '' && href === 'homepage.html')) {
            item.classList.add('active');
        }
    });
}

// Add animation styles
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideOut {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(20px);
            }
        }

        .dropdown-menu {
            position: absolute;
            top: 100%;
            right: 0;
            background: white;
            border: 1px solid #e0ddd6;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            min-width: 150px;
            z-index: 1000;
        }

        .dropdown-menu a {
            display: block;
            padding: 12px 16px;
            text-decoration: none;
            color: #1a1a1a;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
        }

        .dropdown-menu a:last-child {
            border-bottom: none;
        }

        .dropdown-menu a:hover {
            background: #f5f2eb;
        }

        .user-menu {
            position: relative;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .avatar-btn {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #1a3c34;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: 600;
            font-size: 12px;
            border: 2px solid rgba(255,255,255,0.2);
        }

        .avatar-btn:hover {
            background: #2d6a56;
        }
    `;
    document.head.appendChild(style);
}

// Initialize global setup
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    addAnimationStyles();
    initAuthUI();
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.avatar-btn')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});
