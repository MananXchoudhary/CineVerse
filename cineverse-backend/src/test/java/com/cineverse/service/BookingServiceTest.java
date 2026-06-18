package com.cineverse.service;

import com.cineverse.exception.SeatUnavailableException;
import com.cineverse.model.Booking;
import com.cineverse.repository.BookingRepository;
import com.cineverse.service.BookingEventProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;


import java.util.Arrays;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * ============================================================
 *  BookingServiceTest — Day 09: Service Layer Testing
 * ============================================================
 *
 *  Uses Mockito to mock BookingRepository, ensuring service
 *  logic is tested in complete isolation — no real DB needed.
 *
 *  Academic Insight:
 *  @Mock creates a mock object. @InjectMocks injects mocks into
 *  the class under test. This is the foundation of unit testing
 *  — fast, independent, and focused on one component at a time.
 * ============================================================
 */
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    // Day 08: Mock BookingEventProducer so RabbitMQ is never called in tests
    // Academic Insight: @Mock creates a "fake" object — publishBookingEvent()
    // does nothing (returns null) instead of connecting to RabbitMQ
    @Mock
    private BookingEventProducer eventProducer;

    @InjectMocks
    private BookingService bookingService;


    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    // ─────────────────────────────────────────────────────────
    // Test 1: Unit Test — Simple arithmetic (from slides example)
    // Academic Insight: Even simple methods need tests!
    // ─────────────────────────────────────────────────────────
    @Test
    void testAdd() {
        assertEquals(5, bookingService.add(2, 3));
        assertEquals(0, bookingService.add(0, 0));
        assertEquals(-1, bookingService.add(1, -2));
    }

    // ─────────────────────────────────────────────────────────
    // Test 2: Happy Path — Successful booking creation
    // Mocks repository.save() → returns pre-built Booking
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_Success() {
        Booking booking = new Booking("SH1", Arrays.asList("A1", "A2"));
        booking.setId(1L);

        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        Booking result = bookingService.createBooking(new Booking("SH1", Arrays.asList("A1", "A2")));

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("CONFIRMED", result.getStatus());

        // Verify repository.save() was called exactly once
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    // ─────────────────────────────────────────────────────────
    // Test 3: Edge Case — Empty seat list throws exception
    // Academic Insight: Validate inputs before DB interaction
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_EmptySeats_ThrowsException() {
        Booking booking = new Booking("SH1", Collections.emptyList());

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking(booking);
        });

        // Ensure repository is NEVER called for invalid input
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    // ─────────────────────────────────────────────────────────
    // Test 4: Edge Case — Null seat list throws exception
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_NullSeats_ThrowsException() {
        Booking booking = new Booking("SH1", null);

        assertThrows(IllegalArgumentException.class, () -> {
            bookingService.createBooking(booking);
        });

        verify(bookingRepository, never()).save(any(Booking.class));
    }

    // ─────────────────────────────────────────────────────────
    // Test 5: Exception Test — Double booking same seat
    // Academic Insight: Error handling is as important as success!
    // Simulates race condition / concurrent booking scenario.
    // ─────────────────────────────────────────────────────────
    @Test
    void testSeatAlreadyBooked() {
        bookingService.bookSeat("A1"); // First booking — succeeds

        assertThrows(SeatUnavailableException.class, () -> {
            bookingService.bookSeat("A1"); // Second booking — throws
        });
    }

    // ─────────────────────────────────────────────────────────
    // Test 6: Exception Test — createBooking with already-locked seat
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_SeatAlreadyLocked_ThrowsException() {
        // Lock seat A3 first
        bookingService.bookSeat("A3");

        Booking duplicateBooking = new Booking("SH1", Arrays.asList("A3"));

        assertThrows(SeatUnavailableException.class, () -> {
            bookingService.createBooking(duplicateBooking);
        });

        // Repository should NOT be called for a locked seat
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    // ─────────────────────────────────────────────────────────
    // Test 7: Verify booking status is set to CONFIRMED
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_StatusIsConfirmed() {
        Booking toSave = new Booking("SH5", Arrays.asList("D1"));

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(99L);
            return b;
        });

        Booking result = bookingService.createBooking(toSave);

        assertEquals("CONFIRMED", result.getStatus());
    }
}
