const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-flash-latest',
];

// ✅ Common function jo fallback handle kare
async function generateWithFallback(prompt) {
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      let text = result.response.text().trim();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return text;
    } catch (err) {
      console.log(`❌ ${modelName} failed: ${err.message}`);
      lastError = err;

      if (err.status === 503 || err.status === 429) continue;
      if (err.status >= 400 && err.status < 500 && err.status !== 429) throw err;
    }
  }

  throw lastError;
}

async function extractSamanInfo(hindiText) {
  const prompt = `
Tum ek shop assistant ho. Neeche Hindi mein customer ki baat hai.
Isse JSON format mein extract karo.

Text: "${hindiText}"

Sirf ye JSON return karo, kuch aur nahi:
{
  "customer_name": "naam",
  "items": [
    {"name": "samman", "quantity": 1, "price": 50}
  ],
  "total": 50
}

Rules:
- Agar quantity nahi batayi, to 1 maano
- Agar price nahi batayi, to estimate karo Indian shop rates se
- Total ko add karke likho
- Customer ka naam Hindi mein hi rakho
`;

  try {
    const text = await generateWithFallback(prompt);
    return JSON.parse(text);
  } catch (e) {
    console.error('Extract error:', e);
    return { customer_name: 'Unknown', items: [], total: 0 };
  }
}

async function extractPaymentInfo(hindiText) {
  const prompt = `
Hindi text: "${hindiText}"

Ye payment ki baat hai. Extract karo:
{
  "customer_name": "naam",
  "amount": 50,
  "method": "PhonePe"
}

Sirf JSON return karo.
`;

  try {
    const text = await generateWithFallback(prompt);
    return JSON.parse(text);
  } catch (e) {
    return { customer_name: 'Unknown', amount: 0, method: 'PhonePe' };
  }
}

module.exports = { extractSamanInfo, extractPaymentInfo };