const db = require('../config/db');

class User {
    static async findByUsername(username) {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async create({ username, password_hash, email }) {
        const [result] = await db.query(
            'INSERT INTO users (username, password_hash, email) VALUES (?, ?, ?)', [username, password_hash, email]
        );
        return result.insertId;
    }

    static async updateBalance(userId, amount) {
        await db.query('UPDATE users SET balance = balance + ? WHERE id = ?', [amount, userId]);
    }

    static async getBalance(userId) {
        const [rows] = await db.query('SELECT balance FROM users WHERE id = ?', [userId]);
        return rows[0].balance;
    }
}

module.exports = User;