const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            console.log("Token:", token);

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET
            );

            console.log("Decoded:", decoded);

            const user = await User.findById(decoded.id)
                .select('-password');

            console.log("User:", user);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not found'
                });
            }

            req.user = user;

            next();

        } catch (error) {
            console.log("Auth Error:", error);

            return res.status(401).json({
                success: false,
                error: error.message
            });
        }
    } else {
        return res.status(401).json({
            success: false,
            error: 'No token provided'
        });
    }
};

const adminOnly = (req, res, next) => {
    if (
        req.user &&
        req.user.role === 'admin'
    ) {
        return next();
    }

    return res.status(403).json({
        success: false,
        error: 'Admin access required'
    });
};

module.exports = {
    protect,
    adminOnly
};