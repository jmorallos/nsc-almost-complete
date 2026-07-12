import { ipcMain } from 'electron';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();

export function registerAuthIpc() {
    ipcMain.handle('auth:login', async (_event, username, password) => authService.login(username, password));
}
