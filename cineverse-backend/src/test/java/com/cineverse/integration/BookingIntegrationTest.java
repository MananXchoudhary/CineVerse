package com.cineverse.integration;

import com.cineverse.exception.SeatUnavailableException;
import com.cineverse.model.Booking;
import com.cineverse.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================
 *  BookingIntegrationTest — Day 09: Integration Testing
 * ============================================================
 *
 *  Uses @SpringBootTest to load the full application context.
 *  Tests interaction between: Controller → Service → Repository → DB
 *
 *  Academic Insight:
 *  Unlike unit tests that test in isolation, integration tests
 *  validate that all layers work together correctly.
 *  In production, this catches wiring errors that unit tests miss.
 *
 *  Scenario Covered:
 *  "Create booking → Lock seat → Verify DB + seat locking"
 * ============================================================
 */
@SpringBootTest
class BookingIntegrationTest {

    @Autowired
    private BookingService bookingService;

    // ─────────────────────────────────────────────────────────
    // Test 1: Full Booking Flow — E2E
    // Validates: Service → Repository → DB persistence
    // ─────────────────────────────────────────────────────────
    @Test
    void testBookingFlow_CreateAndVerify() {
        Booking booking = new Booking("SH1", Arrays.asList("B1", "B2"));

        // Create booking (Service → Repository → DB)
        Booking savedBooking = bookingService.createBooking(booking);

        // Verify DB persistence
        assertNotNull(savedBooking.getId());
        assertEquals("CONFIRMED", savedBooking.getStatus());
        assertEquals("SH1", savedBooking.getShowId());
        assertEquals(2, savedBooking.getSeatIds().size());
    }

    // ─────────────────────────────────────────────────────────
    // Test 2: Seat Locking — Double Booking Prevention
    // Academic Insight: Validates seat locking logic (Redis SET NX simulation)
    // Scenario: User A books C1 → User B tries to book C1 → Exception thrown
    // ─────────────────────────────────────────────────────────
    @Test
    void testSeatLocking_PreventsConcurrentDoubleBooking() {
        // User A books seat C1 (succeeds)
        bookingService.bookSeat("C1");

        // User B tries to book seat C1 (should fail — seat locked)
        assertThrows(SeatUnavailableException.class, () -> {
            bookingService.bookSeat("C1");
        });
    }

    // ─────────────────────────────────────────────────────────
    // Test 3: Full Booking + Seat Lock — createBooking with conflict
    // Scenario: Book E1 successfully, then try again via createBooking
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_SeatAlreadyLockedViaBookSeat_ThrowsException() {
        // Pre-lock seat E1 (simulates another user already in checkout)
        bookingService.bookSeat("E1");

        // Attempting full booking for same seat should fail
        Booking conflictBooking = new Booking("SH_INT", Arrays.asList("E1"));

        assertThrows(SeatUnavailableException.class, () -> {
            bookingService.createBooking(conflictBooking);
        });
    }

    // ─────────────────────────────────────────────────────────
    // Test 4: Error Handling — Empty Seat List at Integration Level
    // Validates: exception propagates correctly through all layers
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_EmptySeats_ThrowsAtIntegrationLevel() {
        Booking invalidBooking = new Booking("SH_INVALID", Collections.emptyList());

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking(invalidBooking);
        });
    }

    // ─────────────────────────────────────────────────────────
    // Test 5: Multiple Sequential Bookings — Different Seats
    // Validates system handles multiple valid bookings correctly
    // ─────────────────────────────────────────────────────────
    @Test
    void testMultipleBookings_DifferentSeats_AllSucceed() {
        Booking booking1 = new Booking("SH_MULTI", Arrays.asList("F1", "F2"));
        Booking booking2 = new Booking("SH_MULTI", Arrays.asList("G1", "G2"));

        Booking result1 = bookingService.createBooking(booking1);
        Booking result2 = bookingService.createBooking(booking2);

        assertNotNull(result1.getId());
        assertNotNull(result2.getId());
        assertEquals("CONFIRMED", result1.getStatus());
        assertEquals("CONFIRMED", result2.getStatus());
        // IDs should be different
        assertNotEquals(result1.getId(), result2.getId());
    }
}
