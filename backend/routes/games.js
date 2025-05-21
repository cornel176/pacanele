const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const coinFlipController = require('../controllers/coinFlip');
const diceRollController = require('../controllers/diceRoll');
const slotsController = require('../controllers/slots');

router.use(authMiddleware.authenticate);

// Coin Flip
router.post('/coin-flip', coinFlipController.play);
router.get('/coin-flip/history', coinFlipController.history);

// Dice Roll
router.post('/dice-roll', diceRollController.play);
router.get('/dice-roll/history', diceRollController.history);

// Slots
router.post('/slots/spin', slotsController.spin);
router.get('/slots/history', slotsController.history);

module.exports = router;