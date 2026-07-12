let _departments = [];

function getApi() {
    if (!window.api) throw new Error('Database API not available. Run inside Electron.');
    return window.api;
}

export async function initDepartments() {
    _departments = await getApi().departments.list();
}

export function getAllDepartments() { return _departments; }

export function getDepartmentById(id) {
    return _departments.find(d => d.id === id) ?? null;
}

export async function addDepartment(data) {
    const dept = await getApi().departments.create(data);
    _departments.push(dept);
    return dept;
}

export async function updateDepartment(id, data) {
    const dept = await getApi().departments.update(id, data);
    const idx = _departments.findIndex(d => d.id === id);
    if (idx !== -1) _departments[idx] = dept;
    return dept;
}

export async function deleteDepartment(id) {
    await getApi().departments.delete(id);
    _departments = _departments.filter(d => d.id !== id);
}

export async function replaceDepts(arr) {
    _departments = await getApi().departments.replaceAll(arr);
}
