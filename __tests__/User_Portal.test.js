/**
 * @jest-environment jsdom
 */

require('regenerator-runtime/runtime');

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

const { onAuthStateChanged } = require('firebase/auth');
const { getDoc } = require('firebase/firestore');

describe('Requirement 3 – User Portal', () => {
  beforeEach(async () => {
    jest.resetModules();

    // Provide every element the portal script references
    document.body.innerHTML = `
      <div id="welcomeMessage"></div>
      <button id="logoutButton" style="display:none"></button>
      <div id="eventList"></div>
      <div id="eventModal"></div>
      <button id="closeModal"></button>
      <button id="viewDirectionsBtn"></button>
      <button id="cancelEventBtn"></button>
      <div id="eventModalTitle"></div>
      <div id="eventModalDescription"></div>
    `;

    // Stub user login & data fetch
    onAuthStateChanged.mockImplementation((auth, cb) => cb({ uid: 'userA' }));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ firstName: 'Alice' }) });

    // Load the portal script
    require('../public/userportalscript.js');
    await Promise.resolve();
  });

  test('greeting and logout button are shown', () => {
    expect(document.getElementById('welcomeMessage').textContent)
      .toContain('Welcome, to your user portal Alice!');
    expect(document.getElementById('logoutButton').style.display).toBe('block');
  });
});
