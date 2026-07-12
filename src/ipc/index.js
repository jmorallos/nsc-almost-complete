import { registerEmployeeIpc } from './employee.js';
import { registerDepartmentIpc } from './department.js';
import { registerUserIpc } from './user.js';
import { registerAuthIpc } from './auth.js';

export function registerAllIpc() {
    registerEmployeeIpc();
    registerDepartmentIpc();
    registerUserIpc();
    registerAuthIpc();
}
