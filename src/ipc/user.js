import { ipcMain } from 'electron';
import { UserRepository } from '../repositories/UserRepository.js';

const userRepository = new UserRepository();

export function registerUserIpc() {
    ipcMain.handle('users:list', () => userRepository.list());

    ipcMain.handle('users:findById', (_event, id) => userRepository.findById(id));

    ipcMain.handle('users:create', async (_event, data) => userRepository.create(data));

    ipcMain.handle('users:delete', (_event, id) => {
        userRepository.delete(id);
        return true;
    });
}
