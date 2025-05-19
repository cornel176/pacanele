class GamesHelper {
    static coinFlip() {
        return Math.random() < 0.5 ? 'heads' : 'tails';
    }

    static diceRoll() {
        return Math.floor(Math.random() * 6) + 1;
    }

    static slotsSpin() {
        const symbols = ['🍒', '🍋', '🍊', '🍇', '🍉', '7️⃣', '💰', '🔔'];
        const reels = [];

        for (let i = 0; i < 3; i++) {
            reels.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }

        return reels;
    }

    static calculateSlotsPayout(reels, betAmount) {
        // Toate 3 simboluri identice
        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            const multipliers = {
                '🍒': 2,
                '🍋': 3,
                '🍊': 4,
                '🍇': 5,
                '🍉': 7,
                '7️⃣': 10,
                '💰': 15,
                '🔔': 20
            };
            return betAmount * multipliers[reels[0]];
        }

        // 2 simboluri identice
        if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
            return betAmount * 1.5;
        }

        return 0;
    }
}

module.exports = GamesHelper;