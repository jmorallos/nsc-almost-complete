import { ulid } from 'ulid';
import { getDb } from '../database/db.js';
import { mapDocument } from '../mappers/employeeMapper.js';

const now = () => new Date().toISOString();

const SAMPLE_DOC_NAMES = [
    'Personal Data Sheet (CS Form 212)', 'Employment Contract', 'Appointment Paper',
    'Service Record', 'Certificate of Eligibility (CSC)', 'NBI Clearance',
    'Transcript of Records', 'Oath of Office', 'Medical Certificate',
];

function parseSize(sizeStr) {
    if (!sizeStr || sizeStr === '—') return null;
    const match = String(sizeStr).match(/^([\d.]+)\s*(KB|MB|B)$/i);
    if (!match) return null;
    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'MB') return Math.round(value * 1024 * 1024);
    if (unit === 'KB') return Math.round(value * 1024);
    return Math.round(value);
}

function inferMimeType(type, fileName) {
    if (type === 'pdf') return 'application/pdf';
    const ext = (fileName ?? '').split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (['jpg', 'jpeg'].includes(ext)) return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    return null;
}

export class DocumentRepository {
    listByEmployee(employeeId) {
        const db = getDb();
        const rows = db.prepare(`
            SELECT * FROM documents
            WHERE employee_id = ? AND is_active = 1
            ORDER BY uploaded_at DESC
        `).all(employeeId);
        return rows.map(mapDocument);
    }

    findById(id) {
        const db = getDb();
        const row = db.prepare('SELECT * FROM documents WHERE id = ? AND is_active = 1').get(id);
        return row ? mapDocument(row) : null;
    }

    create(employeeId, data) {
        const db = getDb();
        const employee = db.prepare('SELECT id FROM employees WHERE id = ?').get(employeeId);
        if (!employee) throw new Error(`Employee #${employeeId} not found.`);

        const id = ulid();
        const ts = now();
        const uploadedAt = data.date ? `${data.date}T00:00:00.000Z` : ts;

        db.prepare(`
            INSERT INTO documents (
                id, employee_id, document_type_id, file_name, file_path, file_size,
                mime_type, issued_date, expiry_date, remarks, source,
                uploaded_at, uploaded_by, created_at, updated_at, updated_by, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        `).run(
            id,
            employeeId,
            null,
            data.name,
            null,
            parseSize(data.size) ?? data.fileSize ?? null,
            inferMimeType(data.type, data.name),
            null,
            null,
            null,
            data.source ?? 'upload',
            uploadedAt,
            'system',
            ts,
            ts,
            null,
        );

        return this.findById(id);
    }

    delete(id) {
        const db = getDb();
        const existing = db.prepare('SELECT id FROM documents WHERE id = ? AND is_active = 1').get(id);
        if (!existing) throw new Error(`Document #${id} not found.`);

        const ts = now();
        db.prepare('UPDATE documents SET is_active = 0, updated_at = ? WHERE id = ?').run(ts, id);
    }

    addSampleDocuments(employeeId) {
        const db = getDb();
        const existing = db.prepare(
            'SELECT file_name FROM documents WHERE employee_id = ? AND is_active = 1'
        ).all(employeeId);
        const existingNames = new Set(existing.map((d) => d.file_name));

        let added = 0;
        const today = now().slice(0, 10);

        for (const name of SAMPLE_DOC_NAMES) {
            const filename = `${name}.pdf`;
            if (!existingNames.has(filename)) {
                this.create(employeeId, {
                    name: filename,
                    type: 'pdf',
                    size: '—',
                    date: today,
                    source: 'sample',
                });
                added++;
            }
        }

        return added;
    }
}
