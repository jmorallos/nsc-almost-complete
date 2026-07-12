function getApi() {
    if (!window.api) throw new Error('Database API not available. Run inside Electron.');
    return window.api;
}

export function initUsers() {
    // No local cache needed for user listing; loaded on demand.
}

export async function getAllUsers() {
    return getApi().users.list();
}

export async function findByCredentials(username, password) {
    return getApi().auth.login(username, password);
}

export async function addUser(data) {
    return getApi().users.create(data);
}

export async function deleteUser(id) {
    await getApi().users.delete(id);
}
