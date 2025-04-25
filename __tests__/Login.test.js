/**
 * @jest-environment jsdom
 */

require('regenerator-runtime/runtime');

// Mock firebase/auth with working setPersistence
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  setPersistence: jest.fn(() => Promise.resolve()),
  browserLocalPersistence: {}
}));
jest.mock('sweetalert2');

const { signInWithEmailAndPassword } = require('firebase/auth');
const Swal = require('sweetalert2');

describe('Requirement 1 – User Login (network/site failure)', () => {
  beforeEach(() => {
    jest.resetModules();

    // Render the login form
    document.body.innerHTML = `
      <form id="loginForm">
        <input id="username" value="user@example.com" />
        <input id="password" value="Password123" />
      </form>
    `;
    // Stub a network error
    signInWithEmailAndPassword.mockRejectedValue(new Error('Network error'));

    // Load the login handler
    require('../public/loginscript.js');
  });

  test('correct credentials but site error → no success pop-up', async () => {
    document.getElementById('loginForm')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await Promise.resolve();

    expect(Swal.fire).not.toHaveBeenCalled();
  });
});
