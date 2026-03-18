const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db/database');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || 'finsight-super-secret-key-2026';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '.'))); // serve the frontend from the root dir

const upload = multer({ dest: 'uploads/' });

// ==========================================
// Authentication Middleware
// ==========================================
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) return res.status(401).json({ error: "Access Denied: No Token Provided" });

    const token = bearerHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access Denied: Invalid Token Format" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Access Denied: Invalid or Expired Token" });
        req.user = decoded; // add user id/info to request
        next();
    });
}

// ==========================================
// Auth Routes
// ==========================================
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });

    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)');
    stmt.run(name, email, hash, function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) return res.status(400).json({ error: "Email already exists" });
            return res.status(500).json({ error: "Failed to register" });
        }
        res.status(201).json({ message: "Registration successful" });
    });
    stmt.finalize();
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(401).json({ error: "Invalid email or password" });

        const validPass = bcrypt.compareSync(password, user.password_hash);
        if (!validPass) return res.status(401).json({ error: "Invalid email or password" });

        const tokenPayload = { id: user.id, email: user.email, name: user.name, role: user.role };
        const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: '12h' });

        res.json({ message: "Login successful", token, user: tokenPayload });
    });
});

app.get('/api/auth/me', verifyToken, (req, res) => {
    res.json(req.user);
});

// ==========================================
// Protected API Routes
// ==========================================

// Dashboard KPIs
app.get('/api/dashboard/kpis', verifyToken, (req, res) => {
    db.get("SELECT * FROM kpis WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// Dashboard Revenue Chart Data
app.get('/api/dashboard/revenue', verifyToken, (req, res) => {
    db.get("SELECT * FROM revenue_data WHERE id = 1", (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({
                months: JSON.parse(row.months),
                dataPoints: JSON.parse(row.dataPoints)
            });
        } else {
            res.status(404).json({ error: "Data not found" });
        }
    });
});

// Recent Transactions
app.get('/api/dashboard/transactions', verifyToken, (req, res) => {
    db.all("SELECT * FROM documents ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Documents List
app.get('/api/documents', verifyToken, (req, res) => {
    db.all("SELECT * FROM documents ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Upload Document
app.post('/api/documents/upload', verifyToken, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileName = req.file.originalname;
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    const docType = isPdf ? 'PDF' : 'CSV';
    const fakeSize = (Math.random() * 5 + 0.5).toFixed(1) + ' MB';
    const date = new Date().toISOString().split('T')[0];
    
    // Insert new document as 'Processing'
    const stmt = db.prepare(`INSERT INTO documents (name, type, size, uploadDate, status, anomalies, threatLevel) VALUES (?, ?, ?, ?, 'Scanning', 0, 'Pending')`);
    stmt.run(fileName, docType, fakeSize, date, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        const newId = this.lastID;
        res.json({ id: newId, message: "Upload successful" });
        
        // Log Upload action
        db.run(`INSERT INTO audit_logs (user, action, details, status, time, initials) VALUES (?, ?, ?, 'Success', 'Just now', ?)`, [req.user.name, 'Document Upload', fileName, req.user.name.substring(0,2).toUpperCase()]);

        // Simulate processing delay of 3 seconds, then update to Analyzed
        setTimeout(() => {
            const anomalies = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
            const threatLevel = anomalies > 0 ? (anomalies > 1 ? 'High' : 'Medium') : 'Clean';
            db.run(`UPDATE documents SET status = 'Analyzed', anomalies = ?, threatLevel = ? WHERE id = ?`, [anomalies, threatLevel, newId], (err) => {
                if (err) console.error("Failed to update process status", err);
            });
        }, 3000);
    });
    stmt.finalize();
});

// Full Ledger Transactions
app.get('/api/transactions/full', verifyToken, (req, res) => {
    db.all("SELECT * FROM full_transactions", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Customers
app.get('/api/customers', verifyToken, (req, res) => {
    db.all("SELECT * FROM customers", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Audit Logs
app.get('/api/audit-logs', verifyToken, (req, res) => {
    db.all("SELECT * FROM audit_logs ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Document Details & Anomaly Mock
app.get('/api/documents/:id/details', verifyToken, (req, res) => {
    const docId = req.params.id;
    db.get('SELECT * FROM documents WHERE id = ?', [docId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Document not found" });

        const anomalies = row.anomalies > 0 ? [`Found ${row.anomalies} irregularities in vendor processing based on cross-checks.`] : [];
        
        res.json({
            id: row.id,
            name: row.name,
            metrics: [
                { label: "Total Revenue", value: "₹1,24,000", change: "+5%" },
                { label: "Processed Items", value: "342", change: "+12%" },
            ],
            anomalies: anomalies
        });
    });
});

// AI Query Mock
app.post('/api/ai/query', verifyToken, (req, res) => {
    const responses = [
        "Based on the analysis, this looks perfectly normal and within 95% confidence intervals.",
        "There's a subtle deviation here. Typically, payroll matches the roster count, but we show a mismatch of 2 entities.",
        "The tax forms attached suggest a missing schedule C.",
        "Everything checks out. The signatures appear completely valid and timestamped."
    ];
    // Artificial AI processing delay
    setTimeout(() => {
        res.json({ answer: responses[Math.floor(Math.random() * responses.length)] });
    }, 1000);
});


// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
