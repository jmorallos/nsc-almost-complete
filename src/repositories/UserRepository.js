import bcrypt from 'bcrypt';
import { ulid } from 'ulid';
import { getDb } from '../database/db.js';
import { mapUser } from '../mappers/employeeMapper.js';

const now = () => new Date().toISOString();

function getOrCreateRole(db, roleName) {
    const existing = db.prepare('SELECT id FROM user_roles WHERE name = ?').get(roleName);
    if (existing) return existing.id;

    const id = ulid();
    const ts = now();
    db.prepare(`
        INSERT INTO user_roles (id, name, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, 1, ?, ?)
    `).run(id, roleName, '', ts, ts);
    return id;
}

export class UserRepository {
    list() {
        const db = getDb();
        const rows = db.prepare(`
            SELECT u.*, ur.name AS role_name
            FROM users u
            JOIN user_roles ur ON ur.id = u.role_id
            ORDER BY u.username
        `).all();
        return rows.map(mapUser);
    }

    findById(id) {
        const db = getDb();
        const row = db.prepare(`
            SELECT u.*, ur.name AS role_name
            FROM users u
            JOIN user_roles ur ON ur.id = u.role_id
            WHERE u.id = ?
        `).get(id);
        return row ? mapUser(row) : null;
    }

    findByUsername(username) {
        const db = getDb();
        return db.prepare('SELECT * FROM users WHERE username = ?').get(username) ?? null;
    }

    async create(data) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(data.username);
        if (existing) throw new Error('Username already exists.');

        const id = ulid();
        const ts = now();
        const roleId = getOrCreateRole(db, data.role ?? 'HR Staff');
        const hash = await bcrypt.hash(data.password, 10);

        db.prepare(`
            INSERT INTO users (id, employee_id, role_id, username, display_name, password, created_at, updated_at, last_login)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(id, null, roleId, data.username, data.name ?? data.username, hash, ts, ts, null);

        return this.findById(id);
    }

    delete(id) {
        const db = getDb();
        const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
        if (!user) throw new Error('User not found.');
        if (user.username === 'admin') throw new Error('Cannot delete the main admin account.');

        db.prepare('DELETE FROM users WHERE id = ?').run(id);
    }
}
