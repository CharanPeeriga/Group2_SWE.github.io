/**
 * @jest-environment jsdom
 */

require('regenerator-runtime/runtime');

jest.mock('firebase/auth');
jest.mock('firebase/firestore');
jest.mock('sweetalert2');

const { onAuthStateChanged } = require('firebase/auth');
const { getDoc, updateDoc } = require('firebase/firestore');
const Swal = require('sweetalert2');

describe('Requirement 2 – Payment Flow for paid events', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();

    // Build the paid-event DOM
    document.body.innerHTML = `
      <div id="eventDetails"></div>
      <section id="paymentSection"></section>
      <form id="paymentForm">
        <input id="cardNumber" value="4242424242424242" />
        <input id="expiry" value="12/25" />
        <input id="cvv" value="123" />
      </form>
      <span id="attendeeCount">1</span>
    `;

    // Simulate a paid-event URL
    const event = {
      event_name: 'PaidEvent',
      price: 50,
      current_attendees_count: 1,
      max_capacity: 5,
      event_id: 'evtPaid'
    };
    delete window.location;
    window.location = { search: `?event=${encodeURIComponent(JSON.stringify(event))}` };

    // Stub Firebase callbacks
    onAuthStateChanged.mockImplementation((auth, cb) => cb({ uid: 'user1' }));
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ bookings: [] }) });
    updateDoc.mockResolvedValue();

    // Load the payment handler
    require('../public/transactionscript.js');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('successful payment flow → shows success popup', async () => {
    // Trigger the form submit
    document.getElementById('paymentForm')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    // Fast-forward the simulated 2s delay
    jest.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(Swal.fire).toHaveBeenCalledWith(
      'Payment Successful',
      'Your payment was successful and the event is booked.',
      'success'
    );
  });
});
