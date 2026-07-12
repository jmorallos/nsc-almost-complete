import { findByCredentials } from '../store/users.js';
import { getEl } from '../utils/helpers.js';

export function initLogin(onSuccess) {
    getEl('login-btn').addEventListener('click', (e) => {
        e.preventDefault();
        attemptLogin(onSuccess);
    });
}

export function attemptLogin(onSuccess) {
    const username = getEl('login-user').value.trim();
    const password = getEl('login-pass').value;
    const errEl = getEl('login-err');

    findByCredentials(username, password).then((user) => {
        if (!user) {
            errEl.textContent = 'Incorrect username or password.';
            getEl('login-pass').value = '';
            setTimeout(() => { errEl.textContent = ''; }, 3000);
            return;
        }
        errEl.textContent = '';
        onSuccess(user);
    }).catch(() => {
        errEl.textContent = 'Login failed. Please try again.';
        setTimeout(() => { errEl.textContent = ''; }, 3000);
    });
}
