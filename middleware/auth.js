const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ status: false, message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ status: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Middleware to verify admin role
const authorizeAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ status: false, message: 'Admin access required' });
    }
    next();
};

// Middleware to verify user role
const authenticateUser = (req, res, next) => {
    if (!req.user || req.user.role === 'admin') {
        return res.status(403).json({ status: false, message: 'User access required' });
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeAdmin,
    authenticateUser
};
