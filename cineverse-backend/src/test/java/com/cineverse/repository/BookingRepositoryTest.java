package com.cineverse.repository;

import com.cineverse.model.Booking;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * ============================================================
 *  BookingRepositoryTest — Day 09: Repository Testing
 * ============================================================
 *
 *  Uses @DataJpaTest which:
 *  - Configures an in-memory H2 database automatically
 *  - Loads only JPA-related beans (no full Spring context)
 *  - Rolls back each test transaction after completion
 *
 *  Academic Insight:
 *  Repository tests ensure correct database queries and
 *  data persistence without requiring a real PostgreSQL DB.
 *  Spring automatically substitutes H2 for the test context.
 * ============================================================
 */
@DataJpaTest
class BookingRepositoryTest {

    @Autowired
    private BookingRepository bookingRepository;

    // ─────────────────────────────────────────────────────────
    // Test 1: Save a booking and verify it gets an ID
    // ─────────────────────────────────────────────────────────
    @Test
    void testSaveBooking_GeneratesId() {
        Booking booking = new Booking("SH1", Arrays.asList("A1", "A2"));
        Booking savedBooking = bookingRepository.save(booking);

        assertNotNull(savedBooking.getId());
        assertTrue(savedBooking.getId() > 0);
    }

    // ─────────────────────────────────────────────────────────
    // Test 2: Save and retrieve a booking by ID
    // ─────────────────────────────────────────────────────────
    @Test
    void testFindById_ReturnsCorrectBooking() {
        Booking booking = new Booking("SH2", Arrays.asList("B1", "B2"));
        Booking saved = bookingRepository.save(booking);

        Optional<Booking> found = bookingRepository.findById(saved.getId());

        assertTrue(found.isPresent());
        assertEquals("SH2", found.get().getShowId());
        assertEquals(Arrays.asList("B1", "B2"), found.get().getSeatIds());
    }

    // ─────────────────────────────────────────────────────────
    // Test 3: Save booking and verify status persists
    // ─────────────────────────────────────────────────────────
    @Test
    void testSaveBooking_StatusPersists() {
        Booking booking = new Booking("SH3", Arrays.asList("C1"));
        booking.setStatus("CONFIRMED");

        Booking saved = bookingRepository.save(booking);

        assertEquals("CONFIRMED", saved.getStatus());
    }

    // ─────────────────────────────────────────────────────────
    // Test 4: Save multiple bookings and check count
    // ─────────────────────────────────────────────────────────
    @Test
    void testSaveMultipleBookings_CountIncreases() {
        bookingRepository.save(new Booking("SH4", Arrays.asList("D1")));
        bookingRepository.save(new Booking("SH4", Arrays.asList("D2")));

        long count = bookingRepository.count();
        assertEquals(2, count);
    }

    // ─────────────────────────────────────────────────────────
    // Test 5: Find non-existent booking returns empty
    // ─────────────────────────────────────────────────────────
    @Test
    void testFindById_NonExistent_ReturnsEmpty() {
        Optional<Booking> found = bookingRepository.findById(9999L);
        assertFalse(found.isPresent());
    }
}
