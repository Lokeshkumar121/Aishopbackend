const db = require('../db/database');

function saveUdhaar(req, res) {
    const { customer_name, items, total } = req.body;
    const date = new Date().toISOString();

    const stmt = db.prepare(
        `INSERT INTO udhaar (customer_name, items, total_amount, date) 
         VALUES (?, ?, ?, ?)`
    );
    const result = stmt.run(customer_name, JSON.stringify(items), total, date);

    res.json({ success: true, id: result.lastInsertRowid });
}

function getAllUdhaar(req, res) {
    const rows = db.prepare(
        `SELECT * FROM udhaar ORDER BY date DESC`
    ).all();

    const parsed = rows.map(r => ({
        ...r,
        items: JSON.parse(r.items),
    }));

    res.json(parsed);
}

function markPaid(req, res) {
    const { id } = req.params;
    db.prepare(`UPDATE udhaar SET status = 'paid' WHERE id = ?`).run(id);
    res.json({ success: true });
}

module.exports = { saveUdhaar, getAllUdhaar, markPaid };