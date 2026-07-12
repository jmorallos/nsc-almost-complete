import { ipcMain } from 'electron';
import { DepartmentRepository } from '../repositories/DepartmentRepository.js';

const departmentRepository = new DepartmentRepository();

export function registerDepartmentIpc() {
    ipcMain.handle('departments:list', () => departmentRepository.list());

    ipcMain.handle('departments:findById', (_event, id) => departmentRepository.findById(id));

    ipcMain.handle('departments:create', (_event, data) => departmentRepository.create(data));

    ipcMain.handle('departments:update', (_event, id, data) => departmentRepository.update(id, data));

    ipcMain.handle('departments:delete', (_event, id) => {
        departmentRepository.delete(id);
        return true;
    });

    ipcMain.handle('departments:replaceAll', (_event, departments) => departmentRepository.replaceAll(departments));
}
