const GamesHelper = require('../utils/games');
const CoinFlip = require('../models/CoinFlip');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const coinFlipController = {
    play: async(req, res) => {
        try {
            const { betAmount, choice } = req.body;
            const userId = req.user.id;

            // Verifică suma pariată
            if (isNaN(betAmount)) {
                return res.status(400).json({ message: 'Invalid bet amount' });
            }

            // Verifică alegerea
            if (!['heads', 'tails'].includes(choice)) {
                return res.status(400).json({ message: 'Invalid choice' });
            }

            // Verifică soldul
            const userBalance = await User.getBalance(userId);
            if (userBalance < betAmount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            // Joacă jocul
            const result = GamesHelper.coinFlip();
            const win = result === choice;
            const payout = win ? betAmount * 1.95 : 0;

            // Actualizează soldul
            const balanceChange = win ? payout : -betAmount;
            await User.updateBalance(userId, balanceChange);

            // Salvează rezultatul
            await CoinFlip.create({
                user_id: userId,
                bet_amount: betAmount,
                user_choice: choice,
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
            const history = await CoinFlip.getHistory(userId);
            res.json(history);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = coinFlipController;