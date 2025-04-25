/**
 * @jest-environment jsdom
 */

jest.mock('firebase/auth');
jest.mock('firebase/firestore');

global.open = jest.fn();

describe('Requirement 4 – View Directions', () => {
  beforeEach(() => {
    jest.resetModules();

    // Provide every element userportalscript references at import & in openEventModal
    document.body.innerHTML = `
      <button id="logoutButton"></button>
      <button id="closeModal"></button>
      <div id="eventModal">
        <div id="eventModalTitle"></div>
        <div id="eventModalDescription"></div>
        <button id="viewDirectionsBtn"></button>
        <button id="cancelEventBtn"></button>
      </div>
    `;

    // Stub the auth watcher so top-level code won't error
    const { onAuthStateChanged } = require('firebase/auth');
    onAuthStateChanged.mockImplementation(() => {});

    // Load the modal wiring
    require('../public/userportalscript.js');
  });

  test('clicking view opens Google Maps with encoded address', () => {
    const event = {
      event_name: 'Any',
      event_category: '',
      location: '1600 Amphitheatre Parkway, Mountain View, CA',
      start_time: { seconds: 0 },
      end_time: { seconds: 0 },
      event_description: ''
    };

    const { openEventModal } = require('../public/userportalscript.js');
    openEventModal(event);
    document.getElementById('viewDirectionsBtn').click();

    const expectedUrl =
      'https://www.google.com/maps?q=' +
      encodeURIComponent(event.location);
    expect(global.open).toHaveBeenCalledWith(expectedUrl, '_blank');
  });
});
