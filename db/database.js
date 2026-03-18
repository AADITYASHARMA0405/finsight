const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const isPostgres = !!process.env.DATABASE_URL;
let dbInstance;

if (isPostgres) {
    console.log('Using PostgreSQL database.');
    dbInstance = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
} else {
    console.log('Connected to the SQLite database.');
    const dbPath = path.join(__dirname, 'finsight.db');
    dbInstance = new sqlite3.Database(dbPath);
}

// Unified Query Interface
const db = {
    get: (sql, params, cb) => {
        if (isPostgres) {
            // PostgreSQL uses $1, $2, ... for parameters
            dbInstance.query(sql.replace(/\?/g, (m, i) => `$${++i}`), params, (err, res) => {
                cb(err, res ? res.rows[0] : null);
            });
        } else {
            dbInstance.get(sql, params, cb);
        }
    },
    all: (sql, params, cb) => {
        if (isPostgres) {
            dbInstance.query(sql.replace(/\?/g, (m, i) => `$${++i}`), params, (err, res) => {
                cb(err, res ? res.rows : []);
            });
        } else {
            dbInstance.all(sql, params, cb);
        }
    },
    run: (sql, params, cb) => {
        if (isPostgres) {
            dbInstance.query(sql.replace(/\?/g, (m, i) => `$${++i}`), params, (err, res) => {
                if (cb) cb(err, res);
            });
        } else {
            dbInstance.run(sql, params, cb);
        }
    },
    prepare: (sql) => {
        // Prepare is a bit trickier in PG, but we'll polyfill it for seating
        return {
            run: (...args) => {
                const params = args.slice(0, -1);
                const cb = args[args.length - 1];
                db.run(sql, params, cb);
            },
            finalize: () => {}
        };
    }
};

// Initialization Logic
if (!isPostgres) {
    initializeDatabase();
} else {
    // For Postgres, we assume the schema is managed or we run migrations
    initializeDatabase();
}

function initializeDatabase() {
    const run = (sql) => isPostgres ? dbInstance.query(sql) : dbInstance.run(sql);
    
    // Create Users Table
    run(`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'User'
    )`);

    // Create Documents Table
    run(`CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
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
    run(`CREATE TABLE IF NOT EXISTS kpis (
        id INTEGER PRIMARY KEY,
        totalDocs INTEGER,
        totalDocsTrend TEXT,
        anomalies INTEGER,
        anomaliesTrend TEXT,
        processed INTEGER,
        processedTrend TEXT,
        highSeverity INTEGER,
        highSeverityTrend TEXT
    )`);

    // Create Full Transactions Table
    run(`CREATE TABLE IF NOT EXISTS full_transactions (
        id SERIAL PRIMARY KEY,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL
    )`);

    // Create Customers Table
    run(`CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        totalSpend REAL NOT NULL,
        lastActive TEXT NOT NULL,
        status TEXT NOT NULL,
        initials TEXT NOT NULL
    )`);

    // Create Audit Logs
    run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        "user" TEXT NOT NULL,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        status TEXT NOT NULL,
        time TEXT NOT NULL,
        initials TEXT NOT NULL
    )`);

    if (!isPostgres) {
        // Check if seeded
        dbInstance.get("SELECT COUNT(*) as count FROM users", (err, row) => {
            if (row && row.count === 0) seedData();
        });
    }
}

function seedData() {
    // Seed Admin User
    const adminPasswordHtml = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT INTO users (email, password_hash, name, role) VALUES ('admin@finsight.io', '${adminPasswordHtml}', 'Aaditya Sharma', 'Admin')`);
    
    // Seed KPIs
    db.run(`INSERT INTO kpis (id, totalDocs, totalDocsTrend, anomalies, anomaliesTrend, processed, processedTrend, highSeverity, highSeverityTrend) 
            VALUES (1, 124, '+12%', 4, '+2', 92, '+5%', 2, '+1')`);

    // Seed Revenue Chart
    db.run(`CREATE TABLE IF NOT EXISTS revenue_data (id INTEGER PRIMARY KEY, months TEXT, dataPoints TEXT)`);
    db.run(`INSERT INTO revenue_data (id, months, dataPoints) VALUES (1, '["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]', '[450000, 520000, 480000, 610000, 590000, 720000]')`);

    console.log('Database seeded with profile: Aaditya Sharma');
}

module.exports = db;
