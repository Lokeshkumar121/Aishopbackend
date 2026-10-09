const express = require('express');
const {
    saveUdhaar,
    getAllUdhaar,
    markPaid,
    deleteUdhaar,
} = require('../controllers/udhaar.controller');

const router = express.Router();

router.post('/', saveUdhaar);
router.get('/', getAllUdhaar);
router.put('/:id/paid', markPaid);
router.delete('/:id', deleteUdhaar);  // ✅ NAYA

module.exports = router;