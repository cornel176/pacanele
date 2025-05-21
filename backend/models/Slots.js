const db = require('../config/db');

class Slots {
    static async create({ user_id, bet_amount, result_symbols, payout }) {
        const [resultDB] = await db.query(
            'INSERT INTO slots (user_id, bet_amount, result_symbols, payout) VALUES (?, ?, ?, ?)', [user_id, bet_amount, result_symbols, payout]
        );
        return resultDB.insertId;
    }

    static async getHistory(userId, limit = 10) {
        const [rows] = await db.query(
            'SELECT * FROM slots WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]
        );
        return rows;
    }
}

module.exports = Slots;