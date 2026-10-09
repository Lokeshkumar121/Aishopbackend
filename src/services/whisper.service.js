const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Updated models — retired models hata diye
const MODELS = [
  'gemini-3.8-flash',      // Primary (latest)
  'gemini-3.5-flash',      // Fallback 1
  'gemini-flash-latest',   // Fallback 2 (Google ka auto-updating alias) [citation:19]
  'gemini-2.0-flash',      // Fallback 3 (stable)
];

// Sleep utility
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function voiceToText(audioPath) {
  const audioData = fs.readFileSync(audioPath);
  const base64Audio = audioData.toString('base64');

  let lastError = null;

  for (const modelName of MODELS) {
    // Har model ko max 2 baar try karo
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        console.log(`🎤 Trying model: ${modelName} (attempt ${attempt + 1})`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent([
          {
            inlineData: {
              mimeType: 'audio/webm',
              data: base64Audio,
            },
          },
          'Is audio ko Hindi mein transcribe karo. Sirf transcribe kiya hua text return karo, kuch aur nahi.',
        ]);

        console.log(`✅ Success with: ${modelName}`);
        return result.response.text().trim();
      } catch (err) {
        console.log(`❌ ${modelName} failed: ${err.message}`);
        lastError = err;

        // Agar 503 ya 429 hai to exponential backoff ke saath retry
        if (err.status === 503 || err.status === 429) {
          const delay = 2000 * Math.pow(2, attempt); // 2s, 4s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await sleep(delay);
          continue;
        }

        // Agar 404 hai (model retired) to next model try karo
        if (err.status === 404) {
          break;
        }

        // Agar 400/403 jaise error hai to yahi ruk jao
        if (err.status >= 400 && err.status < 500 && err.status !== 429) {
          throw err;
        }
      }
    }
  }

  throw lastError || new Error('Saare models fail ho gaye');
}

module.exports = { voiceToText };