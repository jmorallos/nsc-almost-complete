import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { seedDatabase } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let _db = null;

export function getDatabasePath(userDataPath) {
    return path.join(userDataPath, 'app.db');
}

export function initDatabase(userDataPath) {
    if (_db) return _db;

    const dbDir = path.dirname(getDatabasePath(userDataPath));
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    _db = new Database(getDatabasePath(userDataPath));
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');

    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    _db.exec(schema);

    // Migrate existing databases that lack display_name on users
    const userColumns = _db.prepare('PRAGMA table_info(users)').all();
    if (!userColumns.some((col) => col.name === 'display_name')) {
        _db.exec('ALTER TABLE users ADD COLUMN display_name TEXT');
    }

    seedDatabase(_db);

    return _db;
}

export function getDb() {
    if (!_db) {
        throw new Error('Database not initialized. Call initDatabase() first.');
    }
    return _db;
}

export function closeDatabase() {
    if (_db) {
        _db.close();
        _db = null;
    }
}
