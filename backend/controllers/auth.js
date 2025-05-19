const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authController = {
    register: async(req, res) => {
        try {
            const { username, password, email } = req.body;

            // Verifică dacă utilizatorul există deja
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hashuieste parola
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Crează utilizator
            const userId = await User.create({ username, password_hash, email });

            res.status(201).json({ message: 'User created successfully', userId });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    login: async(req, res) => {
        try {
            const { username, password } = req.body;

            // Verifică utilizator
            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Verifică parola
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generează token JWT
            const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin },
                process.env.JWT_SECRET, { expiresIn: '1h' }
            );

            res.json({ token, user: { id: user.id, username: user.username, balance: user.balance } });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authController;