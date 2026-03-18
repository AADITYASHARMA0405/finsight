const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'finsight.db');

// Create a new database instance
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'User'
        )`);

        // Create Documents Table
        db.run(`CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            size TEXT NOT NULL,
            uploadDate TEXT NOT NULL,
            status TEXT NOT NULL,
            anomalies INTEGER DEFAULT 0,
            threatLevel TEXT,
            ai_data TEXT
        )`);

        // Create KPIs Table
        db.run(`CREATE TABLE IF NOT EXISTS kpis (
            id INTEGER PRIMARY KEY DEFAULT 1,
            totalDocs INTEGER,
            totalDocsTrend TEXT,
            anomalies INTEGER,
            anomaliesTrend TEXT,
            processed INTEGER,
            processedTrend TEXT,
            highSeverity INTEGER,
            highSeverityTrend TEXT
        )`);

        // Create Revenue Data Table
        db.run(`CREATE TABLE IF NOT EXISTS revenue_data (
            id INTEGER PRIMARY KEY DEFAULT 1,
            months TEXT,
            dataPoints TEXT
        )`);

        // Create Full Transactions Ledger
        db.run(`CREATE TABLE IF NOT EXISTS full_transactions (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            plan TEXT NOT NULL,
            type TEXT NOT NULL,
            amount INTEGER NOT NULL,
            status TEXT NOT NULL,
            date TEXT NOT NULL
        )`);

        // Create Customers Table
        db.run(`CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            status TEXT NOT NULL,
            plan TEXT NOT NULL,
            date TEXT NOT NULL,
            initials TEXT NOT NULL,
            planClass TEXT
        )`);

        // Create Audit Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            action TEXT NOT NULL,
            details TEXT NOT NULL,
            status TEXT NOT NULL,
            time TEXT NOT NULL,
            initials TEXT NOT NULL
        )`);

        // Check if data exists, if not, seed it
        db.get("SELECT COUNT(*) as count FROM documents", (err, row) => {
            if (row && row.count === 0) {
                console.log("Seeding database...");
                seedData();
            }
        });
    });
}

function seedData() {
    // Seed Admin User
    const adminPasswordHtml = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT INTO users (email, password_hash, name, role) VALUES ('admin@finsight.io', '${adminPasswordHtml}', 'Aaditya Sharma', 'Admin')`);
    
    // Seed Documents
    const insertDoc = db.prepare(`INSERT INTO documents (name, type, size, uploadDate, status, anomalies, threatLevel) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertDoc.run('Q3_Financial_Report.pdf', 'PDF', '2.4 MB', '2026-03-15', 'Analyzed', 2, 'High');
    insertDoc.run('Payroll_Export_Feb.csv', 'CSV', '1.1 MB', '2026-03-14', 'Analyzed', 0, 'Clean');
    insertDoc.run('Vendor_Invoices_Batch.pdf', 'PDF', '8.5 MB', '2026-03-14', 'Scanning', 0, 'Pending');
    insertDoc.run('Tax_Returns_2025.pdf', 'PDF', '4.2 MB', '2026-03-12', 'Analyzed', 1, 'Medium');
    insertDoc.run('Employee_Expenses.csv', 'CSV', '0.8 MB', '2026-03-10', 'Analyzed', 0, 'Clean');
    insertDoc.finalize();

    // Seed KPIs
    db.run(`INSERT INTO kpis (id, totalDocs, totalDocsTrend, anomalies, anomaliesTrend, processed, processedTrend, highSeverity, highSeverityTrend) 
            VALUES (1, 124, '+12%', 4, '-2%', 92, '+5%', 2, 'Stable')`);

    // Seed Revenue
    const months = JSON.stringify(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
    const dataPoints = JSON.stringify([120000, 135000, 128000, 145000, 160000, 155000, 175000, 190000, 185000, 210000, 225000, 240000]);
    db.run(`INSERT INTO revenue_data (id, months, dataPoints) VALUES (1, '${months}', '${dataPoints}')`);

    // Seed Transactions
    const insertTx = db.prepare(`INSERT INTO full_transactions (id, name, plan, type, amount, status, date) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertTx.run('TRX-8902', 'Acme Corp', 'Enterprise', 'Upgrade', 45000, 'Completed', 'Oct 24, 2024');
    insertTx.run('TRX-8901', 'Global Tech', 'Pro', 'Initial', 12500, 'Pending', 'Oct 24, 2024');
    insertTx.run('TRX-8900', 'FinSight Dynamics', 'Enterprise', 'Renewal', 35000, 'Completed', 'Oct 23, 2024');
    insertTx.run('TRX-8899', 'Stark Industries', 'Pro', 'Upgrade', 15000, 'Failed', 'Oct 22, 2024');
    insertTx.run('TRX-8898', 'Wayne Enterprises', 'Enterprise', 'Initial', 120000, 'Completed', 'Oct 20, 2024');
    insertTx.run('TRX-8897', 'Umbrella Corp', 'Pro', 'Renewal', 15000, 'Completed', 'Oct 19, 2024');
    insertTx.finalize();

    // Seed Customers
    const insertCust = db.prepare(`INSERT INTO customers (name, email, status, plan, date, initials, planClass) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    insertCust.run('Acme Corp', 'finance@acme.inc', 'Active', 'Enterprise', 'Jan 12, 2024', 'AC', 'enterprise');
    insertCust.run('Global Tech', 'billing@globaltech.co', 'Active', 'Pro', 'Feb 05, 2024', 'GT', '');
    insertCust.run('FinSight Dynamics', 'accounts@finsight.io', 'At Risk', 'Enterprise', 'Mar 22, 2024', 'FD', 'enterprise');
    insertCust.run('Umbrella Corp', 'billing@umbrella.com', 'Churned', 'Elite', 'Jun 14, 2024', 'UC', 'enterprise');
    insertCust.finalize();

    // Seed Audit Logs
    const insertLog = db.prepare(`INSERT INTO audit_logs (user, action, details, status, time, initials) VALUES (?, ?, ?, ?, ?, ?)`);
    insertLog.run('Aaditya Sharma', 'Document Upload', 'Q4_Projections.pdf', 'Success', '2 mins ago', 'AS');
    insertLog.run('System', 'Monthly Recurring Rev', 'Auto-calculation complete', 'Success', '45 mins ago', 'SY');
    insertLog.run('Abhishek K.', 'Exported Transactions', 'Full ledger (CSV)', 'Success', '1h ago', 'AK');
    insertLog.run('Aaditya Sharma', 'User Permissions', 'Updated access for Dev Team', 'Success', '3h ago', 'AS');
    insertLog.run('Admin', 'Login Attempt', 'IP: 192.168.1.45', 'Failed', '5h ago', 'AD');
    insertLog.finalize();
}

module.exports = db;
