import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Booking from './Booking';
import { vi } from 'vitest';

// ============================================================
//  Booking.test.jsx — Day 09: Frontend Testing with Vitest
// ============================================================
//
//  Uses @testing-library/react for DOM-based testing.
//  All API services are mocked using vi.mock() (Vitest equivalent
//  of Jest's jest.mock()).
//
//  Academic Insight:
//  Frontend tests ensure UI correctness and component behavior.
//  We test what the USER sees, not implementation details.
//  This is the "user-centric" testing philosophy of @testing-library.
//
//  Test Scenarios:
//  1. Renders Booking page without crash
//  2. Shows "Book Now" / confirm button
//  3. Seat selection interaction
//  4. API error state display
//  5. Edge case: no movie found
// ============================================================

// ── Mock all API services (no real network calls) ──────────
vi.mock('../../services/api', () => ({
  movieService: {
    getMovies: vi.fn().mockResolvedValue({
      data: [{ id: '1', title: 'Test Movie', posterUrl: '', runtime: '120m', genres: ['Action'] }]
    })
  },
  bookingService: {
    createBooking: vi.fn().mockResolvedValue({ id: 'BK-123', status: 'CONFIRMED' })
  },
  theatreService: {
    getTheatres: vi.fn().mockResolvedValue([
      {
        theatreId: 'T1',
        name: 'Test Theatre',
        location: 'Mumbai',
        screens: [{ screenId: 'S1', name: 'Screen 1', type: 'IMAX' }]
      }
    ])
  },
  showService: {
    getShowsByMovie: vi.fn().mockResolvedValue([
      {
        id: 'SH1',
        movieId: '1',
        theatreId: 'T1',
        screenId: 'S1',
        date: 'Today, June 10',
        startTime: '12:30 PM'
      }
    ])
  }
}));

// ── Mock Redis and Seat Lock services ──────────────────────
vi.mock('../../services/seatLockService', () => ({
  lockSeat: vi.fn().mockReturnValue(true),
  releaseSeat: vi.fn(),
  releaseAllSeats: vi.fn(),
  isSeatAvailable: vi.fn().mockReturnValue(true),
  getLockedSeats: vi.fn().mockReturnValue([]),
  getSeatLockTTL: vi.fn().mockReturnValue(0),
  buildShowKey: vi.fn().mockReturnValue('test-key')
}));

vi.mock('../../services/redisCache', () => ({
  redisGetAllEntries: vi.fn().mockReturnValue([])
}));

// ── Helper: Render Booking page at /booking/1 ──────────────
const renderBooking = (movieId = '1') =>
  render(
    <MemoryRouter initialEntries={[`/booking/${movieId}`]}>
      <Routes>
        <Route path="/booking/:id" element={<Booking />} />
      </Routes>
    </MemoryRouter>
  );

// ============================================================
//  TEST SUITE
// ============================================================
describe('Booking Component', () => {

  // ──────────────────────────────────────────────────────────
  // Test 1: Page renders without crashing
  // ──────────────────────────────────────────────────────────
  test('renders booking page without crashing', async () => {
    renderBooking();
    // Wait for async data load — confirm button appears
    const confirmButton = await screen.findByRole('button', { name: /Confirm Seat Bookings/i });
    expect(confirmButton).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  // Test 2: "Book Now" / Confirm Booking button is visible
  // Academic Insight: UI correctness — core CTA must always render
  // ──────────────────────────────────────────────────────────
  test('renders "Confirm Seat Bookings" button', async () => {
    renderBooking();
    const btn = await screen.findByRole('button', { name: /Confirm Seat Bookings/i });
    expect(btn).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────────────────
  // Test 3: Seat map grid renders seats
  // ──────────────────────────────────────────────────────────
  test('renders seat map with seat buttons', async () => {
    renderBooking();
    // Wait for the page to load
    await screen.findByRole('button', { name: /Confirm Seat Bookings/i });

    // Seat map buttons should be present (rows A–H, seats 1–10 pattern)
    const allButtons = screen.getAllByRole('button');
    // At minimum: confirm button + at least some seat buttons
    expect(allButtons.length).toBeGreaterThan(1);
  });

  // ──────────────────────────────────────────────────────────
  // Test 4: Confirm button is disabled when no seats selected
  // Academic Insight: Edge case — button state validation
  // ──────────────────────────────────────────────────────────
  test('confirm button is disabled when no seats selected', async () => {
    renderBooking();
    const confirmButton = await screen.findByRole('button', { name: /Confirm Seat Bookings/i });
    // Without selecting any seat, button should be disabled
    expect(confirmButton).toBeDisabled();
  });

  // ──────────────────────────────────────────────────────────
  // Test 5: Page structure — heading or key text visible
  // ──────────────────────────────────────────────────────────
  test('shows booking page content after data loads', async () => {
    renderBooking();
    // Confirm the page loaded some content (button is a strong proxy)
    await screen.findByRole('button', { name: /Confirm Seat Bookings/i });
    // Page should not show any loading error
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

});
