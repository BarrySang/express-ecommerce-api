require('dotenv').config();
const mysql = require('mysql');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to database');
    resetDatabase();
});

function resetDatabase() {
    const tables = ['purchases', 'products', 'users']; // Order matters to avoid FK constraints

    clearTables(tables)
        .then(() => resetAutoIncrement(tables))
        .then(() => {
            console.log('All tables cleared and auto-increment values reset successfully');
            db.end();
        })
        .catch(err => {
            console.error('Error clearing tables:', err);
            db.end();
        });
}

function clearTables(tables) {
    return Promise.all(tables.map(table => deleteFromTable(table)));
}

function deleteFromTable(table) {
    return new Promise((resolve, reject) => {
        db.query(`DELETE FROM ${table}`, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

function resetAutoIncrement(tables) {
    return Promise.all(tables.map(table => resetAutoIncrementForTable(table)));
}

function resetAutoIncrementForTable(table) {
    return new Promise((resolve, reject) => {
        db.query(`ALTER TABLE ${table} AUTO_INCREMENT = 1`, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}
