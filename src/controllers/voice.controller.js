const fs = require('fs');
const path = require('path');
const { voiceToText } = require('../services/whisper.service');
const { extractSamanInfo, extractPaymentInfo } = require('../services/gemini.service');

async function processVoice(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Audio file missing' });
        }

        const audioPath = req.file.path;
        const type = req.body.type;

        // ✅ Audio file ka actual mimetype detect karo
        const ext = path.extname(req.file.originalname || '.webm');
        console.log('Audio file:', audioPath, 'ext:', ext, 'mimetype:', req.file.mimetype);

        const text = await voiceToText(audioPath);
        console.log('Transcribed:', text);

        let data;
        if (type === 'payment') {
            data = await extractPaymentInfo(text);
        } else {
            data = await extractSamanInfo(text);
        }

        fs.unlinkSync(audioPath);

        res.json({
            success: true,
            transcribed_text: text,
            data,
        });
    } catch (err) {
        console.error('Voice process error:', err);
        res.status(500).json({ error: err.message });
    }
}

module.exports = { processVoice };