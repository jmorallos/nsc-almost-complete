import { ipcMain } from 'electron';
import { EmployeeRepository } from '../repositories/EmployeeRepository.js';
import { DocumentRepository } from '../repositories/DocumentRepository.js';

const employeeRepository = new EmployeeRepository();
const documentRepository = new DocumentRepository();

export function registerEmployeeIpc() {
    ipcMain.handle('employees:list', () => employeeRepository.list());

    ipcMain.handle('employees:findById', (_event, id) => employeeRepository.findById(id));

    ipcMain.handle('employees:create', (_event, data) => employeeRepository.create(data));

    ipcMain.handle('employees:update', (_event, id, data) => employeeRepository.update(id, data));

    ipcMain.handle('employees:delete', (_event, id) => {
        employeeRepository.delete(id);
        return true;
    });

    ipcMain.handle('employees:replaceAll', (_event, employees) => employeeRepository.replaceAll(employees));

    ipcMain.handle('documents:add', (_event, employeeId, data) => documentRepository.create(employeeId, data));

    ipcMain.handle('documents:delete', (_event, docId) => {
        documentRepository.delete(docId);
        return true;
    });

    ipcMain.handle('documents:addSample', (_event, employeeId) => documentRepository.addSampleDocuments(employeeId));
}
