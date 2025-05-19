const db = require('../config/db');

class CoinFlip {
    static async create({ user_id, bet_amount, user_choice, result, win }) {
        const [resultDB] = await db.query(
            'INSERT INTO coin_flips (user_id, bet_amount, user_choice, result, win) VALUES (?, ?, ?, ?, ?)', [user_id, bet_amount, user_choice, result, win]
        );
        return resultDB.insertId;
    }

    static async getHistory(userId, limit = 10) {
        const [rows] = await db.query(
            'SELECT * FROM coin_flips WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]
        );
        return rows;
    }
}

module.exports = CoinFlip;