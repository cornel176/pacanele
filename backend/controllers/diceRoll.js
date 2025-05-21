const GamesHelper = require('../utils/games');
const DiceRoll = require('../models/DiceRoll');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const diceRollController = {
    play: async(req, res) => {
        try {
            const { betAmount, guess } = req.body;
            const userId = req.user.id;

            // Verifică suma pariată
            if (isNaN(betAmount) || betAmount <= 0) {
                return res.status(400).json({ message: 'Invalid bet amount' });
            }

            // Verifică ghicirea
            if (isNaN(guess)) {
                return res.status(400).json({ message: 'Invalid guess' });
            }
            const parsedGuess = parseInt(guess);
            if (parsedGuess < 1 || parsedGuess > 6) {
                return res.status(400).json({ message: 'Guess must be between 1 and 6' });
            }

            // Verifică soldul
            const userBalance = await User.getBalance(userId);
            if (userBalance < betAmount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            // Joacă jocul
            const result = GamesHelper.diceRoll();
            const win = result === parsedGuess;
            const payout = win ? betAmount * 5 : 0; // 5x payout pentru ghicire corectă

            // Actualizează soldul
            const balanceChange = win ? payout : -betAmount;
            await User.updateBalance(userId, balanceChange);

            // Salvează rezultatul
            await DiceRoll.create({
                user_id: userId,
                bet_amount: betAmount,
                user_guess: parsedGuess,
                result,
                win
            });

            // Salvează tranzacția
            const newBalance = userBalance + balanceChange;
            await Transaction.create({
                user_id: userId,
                type: win ? 'win' : 'loss',
                amount: win ? payout : betAmount,
                balance_after: newBalance
            });

            res.json({
                result,
                win,
                payout,
                newBalance
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    history: async(req, res) => {
        try {
            const userId = req.user.id;
            const history = await DiceRoll.getHistory(userId);
            res.json(history);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = diceRollController;