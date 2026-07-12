const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    auth: {
        login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
    },
    employees: {
        list: () => ipcRenderer.invoke('employees:list'),
        findById: (id) => ipcRenderer.invoke('employees:findById', id),
        create: (data) => ipcRenderer.invoke('employees:create', data),
        update: (id, data) => ipcRenderer.invoke('employees:update', id, data),
        delete: (id) => ipcRenderer.invoke('employees:delete', id),
        replaceAll: (employees) => ipcRenderer.invoke('employees:replaceAll', employees),
    },
    departments: {
        list: () => ipcRenderer.invoke('departments:list'),
        findById: (id) => ipcRenderer.invoke('departments:findById', id),
        create: (data) => ipcRenderer.invoke('departments:create', data),
        update: (id, data) => ipcRenderer.invoke('departments:update', id, data),
        delete: (id) => ipcRenderer.invoke('departments:delete', id),
        replaceAll: (departments) => ipcRenderer.invoke('departments:replaceAll', departments),
    },
    users: {
        list: () => ipcRenderer.invoke('users:list'),
        findById: (id) => ipcRenderer.invoke('users:findById', id),
        create: (data) => ipcRenderer.invoke('users:create', data),
        delete: (id) => ipcRenderer.invoke('users:delete', id),
    },
    documents: {
        add: (employeeId, data) => ipcRenderer.invoke('documents:add', employeeId, data),
        delete: (docId) => ipcRenderer.invoke('documents:delete', docId),
        addSample: (employeeId) => ipcRenderer.invoke('documents:addSample', employeeId),
    },
});
