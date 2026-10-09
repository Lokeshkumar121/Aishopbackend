const db = require('../db/database');
const { checkFraud } = require('../services/fraud.service');

function savePayment(req, res) {
    const { customer_name, amount, method = 'PhonePe' } = req.body;
    const date = new Date().toISOString();

    const stmt = db.prepare(
        `INSERT INTO payments (customer_name, amount, method, date) 
         VALUES (?, ?, ?, ?)`
    );
    const result = stmt.run(customer_name, amount, method, date);

    const fraud = checkFraud(customer_name);

    res.json({
        success: true,
        id: result.lastInsertRowid,
        fraud_check: fraud,
    });
}

function getPendingPayments(req, res) {
    const rows = db.prepare(
        `SELECT * FROM payments WHERE verified = 'pending' ORDER BY date DESC`
    ).all();

    const withFraud = rows.map(r => ({
        ...r,
        fraud_check: checkFraud(r.customer_name),
    }));

    res.json(withFraud);
}

function verifyPayment(req, res) {
    const { id } = req.params;
    const { verified } = req.body; // 'verified' or 'fraud'

    db.prepare(`UPDATE payments SET verified = ? WHERE id = ?`).run(verified, id);
    res.json({ success: true });
}

module.exports = { savePayment, getPendingPayments, verifyPayment };