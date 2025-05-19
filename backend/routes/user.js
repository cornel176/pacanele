const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const userController = require('../controllers/user');

router.use(authMiddleware.authenticate);

router.get('/profile', userController.getProfile);
router.get('/balance', userController.getBalance);
router.post('/deposit', userController.deposit);
router.post('/withdraw', userController.withdraw);
router.get('/transactions', userController.getTransactions);

module.exports = router;