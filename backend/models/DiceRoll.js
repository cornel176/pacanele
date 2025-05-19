const db = require('../config/db');

class DiceRoll {
    static async create({ user_id, bet_amount, user_guess, result, win }) {
        const [resultDB] = await db.query(
            'INSERT INTO dice_rolls (user_id, bet_amount, user_guess, result, win) VALUES (?, ?, ?, ?, ?)', [user_id, bet_amount, user_guess, result, win]
        );
        return resultDB.insertId;
    }

    static async getHistory(userId, limit = 10) {
        const [rows] = await db.query(
            'SELECT * FROM dice_rolls WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit]
        );
        return rows;
    }
}

module.exports = DiceRoll;