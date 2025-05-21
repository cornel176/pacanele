const User = require('../models/User');
const Transaction = require('../models/Transaction');

const userController = {
    getProfile: async(req, res) => {
        try {
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Nu returna parola
            const { password_hash, ...userData } = user;
            res.json(userData);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getBalance: async(req, res) => {
        try {
            const balance = await User.getBalance(req.user.id);
            res.json({ balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    deposit: async(req, res) => {
        try {
            const { amount } = req.body;

            if (isNaN(amount) || amount <= 0) {
                return res.status(400).json({ message: 'Invalid amount' });
            }

            // Actualizează soldul
            await User.updateBalance(req.user.id, amount);

            // Salvează tranzacția
            const balance = await User.getBalance(req.user.id);
            await Transaction.create({
                user_id: req.user.id,
                type: 'deposit',
                amount,
                balance_after: balance
            });

            res.json({ message: 'Deposit successful', newBalance: balance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    withdraw: async(req, res) => {
        try {
            const { amount } = req.body;

            if (isNaN(amount) || amount <= 0) {
                return res.status(400).json({ message: 'Invalid amount' });
            }

            // Verifică soldul
            const balance = await User.getBalance(req.user.id);
            if (balance < amount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            // Actualizează soldul
            await User.updateBalance(req.user.id, -amount);

            // Salvează tranzacția
            const newBalance = balance - amount;
            await Transaction.create({
                user_id: req.user.id,
                type: 'withdrawal',
                amount,
                balance_after: newBalance
            });

            res.json({ message: 'Withdrawal successful', newBalance });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    getTransactions: async(req, res) => {
        try {
            const transactions = await Transaction.getHistory(req.user.id);
            res.json(transactions);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = userController;