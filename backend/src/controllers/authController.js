const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide name, email and password' 
            });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                error: 'User already exists with this email' 
            });
        }

        const user = await User.create({ 
            name, 
            email, 
            password, 
            role: role || 'user' 
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Please provide email and password' 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email or password' 
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

const getMe = async (req, res) => {
    try {
        res.json({ success: true, data: req.user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { register, login, getMe };