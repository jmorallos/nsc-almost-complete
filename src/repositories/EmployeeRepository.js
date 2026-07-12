import { ulid } from 'ulid';
import { getDb } from '../database/db.js';
import { mapEmployeeListRow, mapEmployeeDetails } from '../mappers/employeeMapper.js';
import { DocumentRepository } from './DocumentRepository.js';

const EMPLOYEE_JOIN = `
    SELECT
        e.*,
        d.name AS department_name,
        p.name AS position_name,
        es.name AS status_name,
        ea.start_date,
        ea.id AS assignment_id,
        ea.department_position_id,
        ea.employment_status_id
    FROM employees e
    LEFT JOIN employee_assignments ea
        ON ea.employee_id = e.id AND ea.is_primary = 1 AND ea.is_active = 1
    LEFT JOIN department_positions dp ON dp.id = ea.department_position_id
    LEFT JOIN departments d ON d.id = dp.department_id
    LEFT JOIN positions p ON p.id = dp.position_id
    LEFT JOIN employment_statuses es ON es.id = ea.employment_status_id
`;

const now = () => new Date().toISOString();

function getOrCreateDepartment(db, name, description = '') {
    const existing = db.prepare('SELECT id FROM departments WHERE name = ? AND is_active = 1').get(name);
    if (existing) return existing.id;

    const id = ulid();
    const ts = now();
    db.prepare(`
        INSERT INTO departments (id, name, description, created_at, updated_at, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    `).run(id, name, description, ts, ts);
    return id;
}

function getOrCreatePosition(db, name) {
    const existing = db.prepare('SELECT id FROM positions WHERE name = ? AND is_active = 1').get(name);
    if (existing) return existing.id;

    const id = ulid();
    const ts = now();
    db.prepare(`
        INSERT INTO positions (id, name, created_at, updated_at, is_active)
        VALUES (?, ?, ?, ?, 1)
    `).run(id, name, ts, ts);
    return id;
}

function getOrCreateDeptPosition(db, departmentId, positionId) {
    const existing = db.prepare(
        'SELECT id FROM department_positions WHERE department_id = ? AND position_id = ? AND is_active = 1'
    ).get(departmentId, positionId);
    if (existing) return existing.id;

    const id = ulid();
    const ts = now();
    db.prepare(`
        INSERT INTO department_positions (id, department_id, position_id, created_at, updated_at, is_active)
        VALUES (?, ?, ?, ?, ?, 1)
    `).run(id, departmentId, positionId, ts, ts);
    return id;
}

function getStatusId(db, statusName) {
    const row = db.prepare('SELECT id FROM employment_statuses WHERE name = ?').get(statusName);
    if (row) return row.id;
    return db.prepare('SELECT id FROM employment_statuses WHERE name = ?').get('Active').id;
}

function getDefaultEmploymentTypeId(db) {
    return db.prepare('SELECT id FROM employment_types WHERE name = ?').get('Full-time').id;
}

export class EmployeeRepository {
    constructor() {
        this.documentRepository = new DocumentRepository();
    }

    list() {
        const db = getDb();
        const rows = db.prepare(`${EMPLOYEE_JOIN} WHERE e.is_active = 1 ORDER BY e.last_name, e.first_name`).all();
        return rows.map(mapEmployeeListRow);
    }

    findById(id) {
        const db = getDb();
        const row = db.prepare(`${EMPLOYEE_JOIN} WHERE e.id = ? AND e.is_active = 1`).get(id);
        if (!row) return null;

        const docs = this.documentRepository.listByEmployee(id);
        return mapEmployeeDetails(row, docs);
    }

    create(data) {
        const db = getDb();
        const employeeId = ulid();
        const ts = now();
        const employmentTypeId = getDefaultEmploymentTypeId(db);

        const createTx = db.transaction(() => {
            db.prepare(`
                INSERT INTO employees (
                    id, employee_no, first_name, last_name, sex, birth_date,
                    contact_number, email, address, profile_picture_url,
                    is_active, remarks, created_at, updated_at, created_by, updated_by
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                employeeId,
                null,
                data.fname,
                data.lname,
                null,
                null,
                data.contact ?? '',
                data.email,
                data.address ?? '',
                data.picture ?? '',
                1,
                '',
                ts,
                ts,
                'system',
                'system',
            );

            if (data.dept && data.position) {
                const deptId = getOrCreateDepartment(db, data.dept);
                const posId = getOrCreatePosition(db, data.position);
                const deptPosId = getOrCreateDeptPosition(db, deptId, posId);

                db.prepare(`
                    INSERT INTO employee_assignments (
                        id, employee_id, department_position_id, employment_type_id,
                        employment_status_id, start_date, end_date, is_active, is_primary,
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
                `).run(
                    ulid(),
                    employeeId,
                    deptPosId,
                    employmentTypeId,
                    getStatusId(db, data.status ?? 'Active'),
                    data.start_date ?? null,
                    null,
                    ts,
                    ts,
                );
            }
        });

        createTx();
        return this.findById(employeeId);
    }

    update(id, data) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
        if (!existing) throw new Error(`Employee #${id} not found.`);

        const ts = now();

        const updateTx = db.transaction(() => {
            db.prepare(`
                UPDATE employees SET
                    first_name = ?, last_name = ?, contact_number = ?, email = ?,
                    address = ?, profile_picture_url = ?, is_active = ?,
                    updated_at = ?, updated_by = ?
                WHERE id = ?
            `).run(
                data.fname,
                data.lname,
                data.contact ?? '',
                data.email,
                data.address ?? '',
                data.picture ?? '',
                1,
                ts,
                'system',
                id,
            );

            const assignment = db.prepare(
                'SELECT id, department_position_id FROM employee_assignments WHERE employee_id = ? AND is_primary = 1 AND is_active = 1'
            ).get(id);

            if (data.dept && data.position) {
                const deptId = getOrCreateDepartment(db, data.dept);
                const posId = getOrCreatePosition(db, data.position);
                const deptPosId = getOrCreateDeptPosition(db, deptId, posId);
                const statusId = getStatusId(db, data.status ?? 'Active');

                if (assignment) {
                    db.prepare(`
                        UPDATE employee_assignments SET
                            department_position_id = ?, employment_status_id = ?,
                            start_date = ?, updated_at = ?
                        WHERE id = ?
                    `).run(deptPosId, statusId, data.start_date ?? null, ts, assignment.id);
                } else {
                    db.prepare(`
                        INSERT INTO employee_assignments (
                            id, employee_id, department_position_id, employment_type_id,
                            employment_status_id, start_date, end_date, is_active, is_primary,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
                    `).run(
                        ulid(),
                        id,
                        deptPosId,
                        getDefaultEmploymentTypeId(db),
                        statusId,
                        data.start_date ?? null,
                        null,
                        ts,
                        ts,
                    );
                }
            } else if (assignment && data.status) {
                db.prepare(`
                    UPDATE employee_assignments SET employment_status_id = ?, updated_at = ?
                    WHERE id = ?
                `).run(getStatusId(db, data.status), ts, assignment.id);
            }
        });

        updateTx();
        return this.findById(id);
    }

    delete(id) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM employees WHERE id = ?').get(id);
        if (!existing) throw new Error(`Employee #${id} not found.`);

        const ts = now();
        const deleteTx = db.transaction(() => {
            db.prepare('UPDATE employees SET is_active = 0, updated_at = ? WHERE id = ?').run(ts, id);
            db.prepare('UPDATE employee_assignments SET is_active = 0, updated_at = ? WHERE employee_id = ?').run(ts, id);
        });
        deleteTx();
    }

    replaceAll(employees) {
        const db = getDb();
        const ts = now();
        const employmentTypeId = getDefaultEmploymentTypeId(db);

        const replaceTx = db.transaction(() => {
            db.prepare('DELETE FROM documents').run();
            db.prepare('DELETE FROM employee_assignments').run();
            db.prepare('DELETE FROM employees').run();

            for (const emp of employees) {
                const employeeId = ulid();
                db.prepare(`
                    INSERT INTO employees (
                        id, employee_no, first_name, last_name, sex, birth_date,
                        contact_number, email, address, profile_picture_url,
                        is_active, remarks, created_at, updated_at, created_by, updated_by
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    employeeId,
                    null,
                    emp.fname,
                    emp.lname,
                    null,
                    null,
                    emp.contact ?? '',
                    emp.email,
                    emp.address ?? '',
                    emp.picture ?? '',
                    1,
                    '',
                    ts,
                    ts,
                    'system',
                    'system',
                );

                if (emp.dept && emp.position) {
                    const deptId = getOrCreateDepartment(db, emp.dept);
                    const posId = getOrCreatePosition(db, emp.position);
                    const deptPosId = getOrCreateDeptPosition(db, deptId, posId);

                    db.prepare(`
                        INSERT INTO employee_assignments (
                            id, employee_id, department_position_id, employment_type_id,
                            employment_status_id, start_date, end_date, is_active, is_primary,
                            created_at, updated_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, ?, ?)
                    `).run(
                        ulid(),
                        employeeId,
                        deptPosId,
                        employmentTypeId,
                        getStatusId(db, emp.status ?? 'Active'),
                        emp.start_date ?? null,
                        null,
                        ts,
                        ts,
                    );
                }

                for (const doc of emp.docs ?? []) {
                    this.documentRepository.create(employeeId, {
                        name: doc.name,
                        type: doc.type,
                        size: doc.size,
                        date: doc.date,
                        source: doc.source,
                    });
                }
            }
        });

        replaceTx();
        return this.list();
    }
}
