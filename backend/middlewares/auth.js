const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authMiddleware = {
    authenticate: async(req, res, next) => {
        try {
            const token = req.header('Authorization').replace('Bearer ', '');

            if (!token) {
                return res.status(401).json({ message: 'No token, authorization denied' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({ message: 'Token is not valid' });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token is not valid' });
        }
    },

    isAdmin: (req, res, next) => {
        if (!req.user.is_admin) {
            return res.status(403).json({ message: 'Admin access required' });
        }
        next();
    }
};

module.exports = authMiddleware;