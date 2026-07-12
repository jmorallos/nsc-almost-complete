import { ulid } from 'ulid';
import { getDb } from '../database/db.js';

const now = () => new Date().toISOString();

export class PositionRepository {
    list() {
        const db = getDb();
        return db.prepare(
            'SELECT id, name FROM positions WHERE is_active = 1 ORDER BY name'
        ).all();
    }

    findById(id) {
        const db = getDb();
        return db.prepare('SELECT * FROM positions WHERE id = ? AND is_active = 1').get(id) ?? null;
    }

    create(data) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM positions WHERE name = ? AND is_active = 1').get(data.name);
        if (existing) throw new Error('Position already exists.');

        const id = ulid();
        const ts = now();
        db.prepare(`
            INSERT INTO positions (id, name, created_at, updated_at, is_active)
            VALUES (?, ?, ?, ?, 1)
        `).run(id, data.name, ts, ts);

        return this.findById(id);
    }

    update(id, data) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM positions WHERE id = ? AND is_active = 1').get(id);
        if (!existing) throw new Error(`Position #${id} not found.`);

        const ts = now();
        db.prepare('UPDATE positions SET name = ?, updated_at = ? WHERE id = ?').run(data.name, ts, id);
        return this.findById(id);
    }

    delete(id) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM positions WHERE id = ? AND is_active = 1').get(id);
        if (!existing) throw new Error(`Position #${id} not found.`);

        const ts = now();
        db.prepare('UPDATE positions SET is_active = 0, updated_at = ? WHERE id = ?').run(ts, id);
    }
}
