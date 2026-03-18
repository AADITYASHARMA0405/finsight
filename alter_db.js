const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'db', 'finsight.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
});

db.run("ALTER TABLE documents ADD COLUMN ai_data TEXT", (err) => {
    if (err) {
        if (err.message.includes("duplicate column name")) {
            console.log("Column ai_data already exists.");
        } else {
            console.error("Failed to alter table:", err);
        }
    } else {
        console.log("Successfully added ai_data column.");
    }
    db.close();
});
