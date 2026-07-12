let _employees = [];

function getApi() {
    if (!window.api) throw new Error('Database API not available. Run inside Electron.');
    return window.api;
}

export async function initEmployees() {
    _employees = await getApi().employees.list();
}

export function getAllEmployees() { return _employees; }

export function getEmployeeById(id) {
    return _employees.find(e => e.id === id) ?? null;
}

export async function refreshEmployee(id) {
    const emp = await getApi().employees.findById(id);
    if (!emp) return null;

    const idx = _employees.findIndex(e => e.id === id);
    if (idx === -1) {
        _employees.push(emp);
    } else {
        _employees[idx] = emp;
    }
    return emp;
}

export async function addEmployee(data) {
    const emp = await getApi().employees.create(data);
    _employees.push(emp);
    return emp;
}

export async function updateEmployee(id, data) {
    const emp = await getApi().employees.update(id, data);
    const idx = _employees.findIndex(e => e.id === id);
    if (idx !== -1) _employees[idx] = emp;
    return emp;
}

export async function deleteEmployee(id) {
    await getApi().employees.delete(id);
    _employees = _employees.filter(e => e.id !== id);
}

export async function addDocument(employeeId, docData) {
    const doc = await getApi().documents.add(employeeId, docData);
    await refreshEmployee(employeeId);
    return doc;
}

export async function deleteDocument(employeeId, docId) {
    await getApi().documents.delete(docId);
    await refreshEmployee(employeeId);
}

export async function addSampleDocuments(employeeId) {
    const added = await getApi().documents.addSample(employeeId);
    await refreshEmployee(employeeId);
    return added;
}

export async function replaceAll(employeesArray) {
    _employees = await getApi().employees.replaceAll(employeesArray);
}
