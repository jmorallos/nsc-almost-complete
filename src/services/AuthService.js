import bcrypt from 'bcrypt';
import { getDb } from '../database/db.js';
import { mapUserSession } from '../mappers/employeeMapper.js';
import { UserRepository } from '../repositories/UserRepository.js';

export class AuthService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async login(username, password) {
        const user = this.userRepository.findByUsername(username);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        const db = getDb();
        const ts = new Date().toISOString();
        db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(ts, user.id);

        const row = db.prepare(`
            SELECT u.*, ur.name AS role_name
            FROM users u
            JOIN user_roles ur ON ur.id = u.role_id
            WHERE u.id = ?
        `).get(user.id);

        return mapUserSession(row);
    }
}
