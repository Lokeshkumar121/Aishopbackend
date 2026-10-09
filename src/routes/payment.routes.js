const express = require('express');
const { savePayment, getPendingPayments, verifyPayment } = require('../controllers/payment.controller');

const router = express.Router();
router.post('/', savePayment);
router.get('/pending', getPendingPayments);
router.put('/:id/verify', verifyPayment);

module.exports = router;