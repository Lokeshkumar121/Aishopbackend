CREATE TABLE IF NOT EXISTS udhaar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    items TEXT NOT NULL,
    total_amount REAL NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT DEFAULT 'PhonePe',
    claimed_by TEXT DEFAULT 'Customer',
    date TEXT NOT NULL,
    verified TEXT DEFAULT 'pending'
);
