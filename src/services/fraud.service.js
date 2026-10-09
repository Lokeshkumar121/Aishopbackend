const db = require('../db/database');

function checkFraud(customerName) {
    const udhaar = db.prepare(
        `SELECT COALESCE(SUM(total_amount), 0) as total 
         FROM udhaar 
         WHERE customer_name = ? AND status = 'pending'`
    ).get(customerName).total;

    const claimed = db.prepare(
        `SELECT COALESCE(SUM(amount), 0) as total 
         FROM payments 
         WHERE customer_name = ? AND verified = 'pending'`
    ).get(customerName).total;

    return {
        udhaar,
        claimed_paid: claimed,
        fraud_alert: claimed > 0 && udhaar > claimed,
    };
}

module.exports = { checkFraud };