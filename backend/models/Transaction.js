const db = require('../config/db');

class Transaction {
    static async create({ user_id, type, amount, balance_after }) {
        const [result] = await db.query(
            'INSERT INTO transactions (user_id, type, amount, balance_after) VALUES (?, ?, ?, ?)', [user_id, type, amount, balance_after]
        );
        return result.insertId;
    }

    static async getHistory(userId, limit = 10) {
        const [rows] = await db.query(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]
        );
        return rows;
    }
}

module.exports = Transaction;