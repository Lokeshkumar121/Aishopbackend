const express = require('express');
const multer = require('multer');
const { processVoice } = require('../controllers/voice.controller');

const router = express.Router();
const upload = multer({ dest: 'src/uploads/' });

router.post('/process', upload.single('audio'), processVoice);

module.exports = router;