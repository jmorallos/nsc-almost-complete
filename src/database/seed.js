import bcrypt from 'bcrypt';
import { ulid } from 'ulid';
import { db as mockDb } from '../../mock-database.js';
import { legacyEmployees, legacyDepartments, legacyUsers } from './legacySeed.js';

const now = () => new Date().toISOString();

function hasData(db) {
    const row = db.prepare('SELECT COUNT(*) AS count FROM employees').get();
    return row.count > 0;
}

function insertRow(db, table, row) {
    const keys = Object.keys(row);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT OR IGNORE INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    db.prepare(sql).run(...keys.map((k) => row[k]));
}

function seedReferenceTables(db) {
    for (const row of mockDb.departments) {
        insertRow(db, 'departments', {
            id: row.id,
            name: row.name,
            description: '',
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active ? 1 : 0,
        });
    }

    for (const row of mockDb.positions) {
        insertRow(db, 'positions', {
            id: row.id,
            name: row.name,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active ? 1 : 0,
        });
    }

    for (const row of mockDb.department_positions) {
        insertRow(db, 'department_positions', {
            id: row.id,
            department_id: row.department_id,
            position_id: row.position_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active ? 1 : 0,
        });
    }

    for (const row of mockDb.employment_types) {
        insertRow(db, 'employment_types', {
            id: row.id,
            name: row.name,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active ? 1 : 0,
        });
    }

    for (const row of mockDb.employment_statuses) {
        insertRow(db, 'employment_statuses', {
            id: row.id,
            name: row.name,
            created_at: row.created_at,
            updated_at: row.updated_at,
            is_active: row.is_active ? 1 : 0,
        });
    }

    for (const row of mockDb.document_types) {
        insertRow(db, 'document_types', {
            id: row.id,
            name: row.name,
            description: row.description ?? '',
            is_required: row.is_required ? 1 : 0,
            is_active: row.is_active ? 1 : 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
        });
    }

    for (const row of mockDb.user_roles) {
        insertRow(db, 'user_roles', {
            id: row.id,
            name: row.name,
            description: row.description ?? '',
            is_active: row.is_active ? 1 : 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
        });
    }
}

function seedMockEmployees(db) {
    for (const row of mockDb.employees) {
        insertRow(db, 'employees', {
            id: row.id,
            employee_no: row.employee_no,
            first_name: row.first_name,
            last_name: row.last_name,
            sex: row.sex,
            birth_date: row.birth_date,
            contact_number: row.contact_number,
            email: row.email,
            address: '',
            profile_picture_url: row.profile_picture_url ?? '',
            is_active: row.is_active ? 1 : 0,
            remarks: row.remarks ?? '',
            created_at: row.created_at,
            updated_at: row.updated_at,
            created_by: row.created_by,
            updated_by: row.updated_by,
        });
    }

    for (const row of mockDb.employee_assignments) {
        insertRow(db, 'employee_assignments', {
            id: row.id,
            employee_id: row.employee_id,
            department_position_id: row.department_position_id,
            employment_type_id: row.employment_type_id,
            employment_status_id: row.employment_status_id,
            start_date: row.start_date,
            end_date: row.end_date,
            is_active: row.is_active ? 1 : 0,
            is_primary: row.is_primary ? 1 : 0,
            created_at: row.created_at,
            updated_at: row.updated_at,
        });
    }

    for (const row of mockDb.documents) {
        insertRow(db, 'documents', {
            id: row.id,
            employee_id: row.employee_id,
            document_type_id: row.document_type_id,
            file_name: row.file_name,
            file_path: row.file_path,
            file_size: row.file_size,
            mime_type: row.mime_type,
            issued_date: row.issued_date,
            expiry_date: row.expiry_date,
            remarks: row.remarks,
            source: 'upload',
            uploaded_at: row.uploaded_at,
            uploaded_by: row.uploaded_by,
            created_at: row.created_at,
            updated_at: row.updated_at,
            updated_by: row.updated_by,
            is_active: 1,
        });
    }

    for (const row of mockDb.users) {
        insertRow(db, 'users', {
            id: row.id,
            employee_id: row.employee_id,
            role_id: row.role_id,
            username: row.username,
            display_name: row.username,
            password: row.password,
            created_at: row.created_at,
            updated_at: row.updated_at,
            last_login: row.last_login,
        });
    }
}

function getOrCreateDepartment(db, name, description = '') {
    const existing = db.prepare('SELECT id FROM departments WHERE name = ?').get(name);
    if (existing) return existing.id;

    const id = ulid();
    const ts = now();
    insertRow(db, 'departments', {
        id, name, description, created_at: ts, updated_at: ts, is_active: 1,
    });
    return id;
}

function getOrCreatePosition(db, name) {
    const existing = db.prepare('SELECT id FROM positions WHERE name = ?').get(name);
    if (existing) return existing.id;

    const id = ulid();
    const ts = now();
    insertRow(db, 'positions', {
        id, name, created_at: ts, updated_at: ts, is_active: 1,
    });
    return id;
}

function getOrCreateDeptPosition(db, departmentId, positionId) {
    const existing = db.prepare(
        'SELECT id FROM department_positions WHERE department_id = ? AND position_id = ?'
    ).get(departmentId, positionId);
    if (existing) return existing.id;

    const id = ulid();
    const ts = now();
    insertRow(db, 'department_positions', {
        id, department_id: departmentId, position_id: positionId,
        created_at: ts, updated_at: ts, is_active: 1,
    });
    return id;
}

function getStatusId(db, statusName) {
    const row = db.prepare('SELECT id FROM employment_statuses WHERE name = ?').get(statusName);
    return row?.id ?? db.prepare('SELECT id FROM employment_statuses WHERE name = ?').get('Active').id;
}

function getDefaultEmploymentTypeId(db) {
    return db.prepare('SELECT id FROM employment_types WHERE name = ?').get('Full-time').id;
}

function parseSize(sizeStr) {
    if (!sizeStr || sizeStr === '—') return null;
    const match = String(sizeStr).match(/^([\d.]+)\s*(KB|MB)$/i);
    if (!match) return null;
    const value = parseFloat(match[1]);
    return match[2].toUpperCase() === 'MB' ? Math.round(value * 1024 * 1024) : Math.round(value * 1024);
}

function seedLegacyDepartments(db) {
    for (const dept of legacyDepartments) {
        getOrCreateDepartment(db, dept.name, dept.description);
    }
}

function seedLegacyEmployees(db) {
    const employmentTypeId = getDefaultEmploymentTypeId(db);

    for (const emp of legacyEmployees) {
        const employeeId = ulid();
        const ts = now();

        insertRow(db, 'employees', {
            id: employeeId,
            employee_no: null,
            first_name: emp.fname,
            last_name: emp.lname,
            sex: null,
            birth_date: null,
            contact_number: emp.contact,
            email: emp.email,
            address: emp.address ?? '',
            profile_picture_url: emp.picture ?? '',
            is_active: 1,
            remarks: '',
            created_at: ts,
            updated_at: ts,
            created_by: 'system',
            updated_by: 'system',
        });

        const deptId = getOrCreateDepartment(db, emp.dept);
        const posId = getOrCreatePosition(db, emp.position);
        const deptPosId = getOrCreateDeptPosition(db, deptId, posId);

        insertRow(db, 'employee_assignments', {
            id: ulid(),
            employee_id: employeeId,
            department_position_id: deptPosId,
            employment_type_id: employmentTypeId,
            employment_status_id: getStatusId(db, emp.status),
            start_date: emp.start_date,
            end_date: null,
            is_active: 1,
            is_primary: 1,
            created_at: ts,
            updated_at: ts,
        });

        for (const doc of emp.docs ?? []) {
            insertRow(db, 'documents', {
                id: ulid(),
                employee_id: employeeId,
                document_type_id: null,
                file_name: doc.name,
                file_path: null,
                file_size: parseSize(doc.size),
                mime_type: doc.type === 'pdf' ? 'application/pdf' : null,
                issued_date: null,
                expiry_date: null,
                remarks: null,
                source: doc.source ?? 'upload',
                uploaded_at: doc.date ?? ts,
                uploaded_by: 'system',
                created_at: ts,
                updated_at: ts,
                updated_by: null,
                is_active: 1,
            });
        }
    }
}

function seedLegacyUsers(db) {
    const roles = [
        { name: 'HR Administrator', description: 'Full HR system access' },
        { name: 'HR Staff', description: 'HR staff access' },
    ];

    for (const role of roles) {
        const existing = db.prepare('SELECT id FROM user_roles WHERE name = ?').get(role.name);
        if (!existing) {
            insertRow(db, 'user_roles', {
                id: ulid(),
                name: role.name,
                description: role.description,
                is_active: 1,
                created_at: now(),
                updated_at: now(),
            });
        }
    }

    for (const user of legacyUsers) {
        const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(user.username);
        if (existing) continue;

        const roleRow = db.prepare('SELECT id FROM user_roles WHERE name = ?').get(user.role);
        const roleId = roleRow?.id ?? db.prepare('SELECT id FROM user_roles LIMIT 1').get()?.id;

        const id = ulid();
        const ts = now();
        const hash = bcrypt.hashSync(user.password, 10);

        insertRow(db, 'users', {
            id,
            employee_id: null,
            role_id: roleId,
            username: user.username,
            display_name: user.name,
            password: hash,
            created_at: ts,
            updated_at: ts,
            last_login: null,
        });
    }
}

export function seedDatabase(db) {
    if (hasData(db)) return;

    const seed = db.transaction(() => {
        seedReferenceTables(db);
        seedMockEmployees(db);
        seedLegacyDepartments(db);
        seedLegacyEmployees(db);
        seedLegacyUsers(db);
    });

    seed();
}
