const GamesHelper = require('../utils/games');
const Slots = require('../models/Slots');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const slotsController = {
    spin: async(req, res) => {
        try {
            const { betAmount } = req.body;
            const userId = req.user.id;

            // Verifică suma pariată
            if (isNaN(betAmount)) {
                return res.status(400).json({ message: 'Invalid bet amount' });
            }

            // Verifică soldul
            const userBalance = await User.getBalance(userId);
            if (userBalance < betAmount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }

            // Joacă jocul
            const result = GamesHelper.slotsSpin();
            const payout = GamesHelper.calculateSlotsPayout(result, betAmount);
            const win = payout > 0;

            // Actualizează soldul
            const balanceChange = win ? payout - betAmount : -betAmount;
            await User.updateBalance(userId, balanceChange);

            // Salvează rezultatul
            await Slots.create({
                user_id: userId,
                bet_amount: betAmount,
                result_symbols: result.join(','),
                payout: win ? payout : 0
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
                payout: win ? payout : 0,
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
            const history = await Slots.getHistory(userId);
            res.json(history);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = slotsController;