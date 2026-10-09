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

// ✅ NAYA: Single udhaar delete
function deleteUdhaar(req, res) {
    try {
        const { id } = req.params;
        const result = db.prepare(`DELETE FROM udhaar WHERE id = ?`).run(id);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Record nahi mila' });
        }
        
        res.json({ success: true, message: 'Record delete ho gaya' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { saveUdhaar, getAllUdhaar, markPaid, deleteUdhaar };