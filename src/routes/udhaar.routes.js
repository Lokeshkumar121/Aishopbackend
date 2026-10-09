const express = require('express');
const { saveUdhaar, getAllUdhaar, markPaid } = require('../controllers/udhaar.controller');

const router = express.Router();
router.post('/', saveUdhaar);
router.get('/', getAllUdhaar);
router.put('/:id/paid', markPaid);

module.exports = router;