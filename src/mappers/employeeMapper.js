export function formatFileSize(bytes) {
    if (bytes == null || bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function mapEmployeeListRow(row) {
    return {
        id: row.id,
        fname: row.first_name,
        lname: row.last_name,
        email: row.email ?? '',
        contact: row.contact_number ?? '',
        address: row.address ?? '',
        position: row.position_name ?? '',
        dept: row.department_name ?? '',
        status: row.status_name ?? 'Active',
        start_date: row.start_date ?? '',
        picture: row.profile_picture_url || null,
    };
}

export function mapEmployeeDetails(row, docs = []) {
    return {
        ...mapEmployeeListRow(row),
        docs: docs.map(mapDocument),
    };
}

export function mapDocument(row) {
    const ext = (row.file_name ?? '').split('.').pop()?.toLowerCase() ?? '';
    let type = 'other';
    if (row.source === 'scan') type = 'scan';
    else if (ext === 'pdf') type = 'pdf';
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'img';
    else if (['doc', 'docx'].includes(ext)) type = 'doc';

    return {
        id: row.id,
        name: row.file_name,
        type,
        size: formatFileSize(row.file_size),
        date: (row.uploaded_at ?? row.created_at ?? '').slice(0, 10),
        source: row.source ?? 'upload',
    };
}

export function mapDepartment(row) {
    return {
        id: row.id,
        name: row.name,
        description: row.description ?? '',
    };
}

export function mapUser(row) {
    return {
        id: row.id,
        name: row.display_name || row.username,
        username: row.username,
        role: row.role_name ?? 'User',
    };
}

export function mapUserSession(row) {
    return {
        id: row.id,
        name: row.display_name || row.username,
        username: row.username,
        role: row.role_name ?? 'User',
    };
}
