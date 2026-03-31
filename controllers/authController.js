const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/jsonDatabase');

// Register User
exports.register = async (req, res) => {
    try {
        const { username, email, password, phone, role } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ status: false, message: 'Username, email, and password are required' });
        }

        // Check if email already exists
        const existing = await db.getUserByEmail(email);
        if (existing) {
            return res.status(400).json({ status: false, message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await db.createUser({
            username,
            email,
            password: hashedPassword,
            phone: phone || null,
            role: role || 'user'
        });

        if (!newUser) {
            return res.status(500).json({ status: false, message: 'Registration failed' });
        }

        res.status(201).json({
            status: true,
            message: 'Registration successful',
            userid: newUser.userid
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ status: false, message: 'Registration failed' });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Email and password required' });
        }

        // Get user
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userid: user.userid, username: user.username, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.json({
            status: true,
            message: 'Login successful',
            token,
            user: {
                userid: user.userid,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ status: false, message: 'Login failed' });
    }
};

// Get Current User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await db.getUserById(req.user.userid);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Remove password from response
        const { password, ...userProfile } = user;
        res.json({ status: true, data: userProfile });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ status: false, message: 'Failed to fetch profile' });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { username, phone } = req.body;
        
        const success = await db.updateUser(req.user.userid, {
            username: username || req.user.username,
            phone: phone || null
        });

        if (!success) {
            return res.status(500).json({ status: false, message: 'Failed to update profile' });
        }

        res.json({ status: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ status: false, message: 'Failed to update profile' });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ status: false, message: 'Current and new password required' });
        }

        const user = await db.getUserById(req.user.userid);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ status: false, message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const success = await db.updateUser(req.user.userid, { password: hashedPassword });

        if (!success) {
            return res.status(500).json({ status: false, message: 'Failed to change password' });
        }

        res.json({ status: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ status: false, message: 'Failed to change password' });
    }
};
