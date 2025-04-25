/**
 * @jest-environment jsdom
 */

require('regenerator-runtime/runtime');

// Mocks
jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('sweetalert2');

const { onAuthStateChanged } = require('firebase/auth');
const { getDoc, updateDoc } = require('firebase/firestore');
const Swal = require('sweetalert2');

describe('Requirement 2 – Book Event (free-event flow)', () => {
  beforeEach(async () => {
    jest.resetModules();

    // Minimal DOM for a free-event scenario
    document.body.innerHTML = `
      <div id="eventDetails"></div>
      <button id="bookNowBtn" data-event-name="FreeEvent"></button>
      <span id="attendeeCount">1</span>
      <section id="paymentSection" class="hidden"></section>
    `;

    // Simulate URL param with price = 0
    const event = {
      event_name: 'FreeEvent',
      current_attendees_count: 1,
      max_capacity: 10,
      price: 0,
      event_id: 'evtFree'
    };
    delete window.location;
    window.location = { search: `?event=${encodeURIComponent(JSON.stringify(event))}` };

    // Stub Firebase callbacks
    onAuthStateChanged.mockImplementation((auth, cb) => cb({ uid: 'user1' }));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ bookings: [] }) });
    updateDoc.mockResolvedValue();

    // Now load the booking handler
    require('../public/transactionscript.js');
    await Promise.resolve();
  });

  test('Clicking Book Now on a free event increments count and shows success', async () => {
    document.getElementById('bookNowBtn').click();
    await Promise.resolve();

    expect(document.getElementById('attendeeCount').textContent).toBe('2');
    expect(Swal.fire).toHaveBeenCalledWith(
      'Event Booked',
      `You've successfully booked FreeEvent.`,
      'success'
    );
  });
});
