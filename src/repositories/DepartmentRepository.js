import { ulid } from 'ulid';
import { getDb } from '../database/db.js';
import { mapDepartment } from '../mappers/employeeMapper.js';

const now = () => new Date().toISOString();

export class DepartmentRepository {
    list() {
        const db = getDb();
        const rows = db.prepare(
            'SELECT * FROM departments WHERE is_active = 1 ORDER BY name'
        ).all();
        return rows.map(mapDepartment);
    }

    findById(id) {
        const db = getDb();
        const row = db.prepare('SELECT * FROM departments WHERE id = ? AND is_active = 1').get(id);
        return row ? mapDepartment(row) : null;
    }

    create(data) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM departments WHERE name = ? AND is_active = 1').get(data.name);
        if (existing) throw new Error('Department already exists.');

        const id = ulid();
        const ts = now();
        db.prepare(`
            INSERT INTO departments (id, name, description, created_at, updated_at, is_active)
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(id, data.name, data.description ?? '', ts, ts);

        return this.findById(id);
    }

    update(id, data) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM departments WHERE id = ? AND is_active = 1').get(id);
        if (!existing) throw new Error(`Department #${id} not found.`);

        const ts = now();
        db.prepare(`
            UPDATE departments SET name = ?, description = ?, updated_at = ?
            WHERE id = ?
        `).run(data.name, data.description ?? '', ts, id);

        return this.findById(id);
    }

    delete(id) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM departments WHERE id = ? AND is_active = 1').get(id);
        if (!existing) throw new Error(`Department #${id} not found.`);

        const ts = now();
        db.prepare('UPDATE departments SET is_active = 0, updated_at = ? WHERE id = ?').run(ts, id);
    }

    replaceAll(departments) {
        const db = getDb();
        const ts = now();

        const replaceTx = db.transaction(() => {
            db.prepare('UPDATE departments SET is_active = 0, updated_at = ?').run(ts);

            for (const dept of departments) {
                const existing = db.prepare('SELECT id FROM departments WHERE name = ?').get(dept.name);
                if (existing) {
                    db.prepare(`
                        UPDATE departments SET description = ?, updated_at = ?, is_active = 1
                        WHERE id = ?
                    `).run(dept.description ?? '', ts, existing.id);
                } else {
                    const id = ulid();
                    db.prepare(`
                        INSERT INTO departments (id, name, description, created_at, updated_at, is_active)
                        VALUES (?, ?, ?, ?, ?, 1)
                    `).run(id, dept.name, dept.description ?? '', ts, ts);
                }
            }
        });

        replaceTx();
        return this.list();
    }
}
