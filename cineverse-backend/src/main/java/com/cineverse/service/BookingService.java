package com.cineverse.service;

// ============================================================
//  BookingService.java — Booking Business Logic
//  Day 06: FSM | Day 07: Redis | Day 08: RabbitMQ
// ============================================================
//
//  Academic Insight: Event-Driven Booking Flow
//
//  BEFORE (Day 06 — Synchronous):
//    createBooking() → save to DB → return response
//    (everything happens in one request)
//
//  AFTER (Day 08 — Asynchronous/Event-Driven):
//    createBooking() → save to DB → publish event → return response
//                                        │
//                                   (background)
//                                        ▼
//                               Consumer processes event:
//                               - Send email
//                               - Update analytics
//                               - Award loyalty points
//
//  Advantage:
//  User gets a fast response. Notifications happen independently.
//  If notification fails → booking is NOT affected (decoupling).
// ============================================================

import com.cineverse.exception.SeatUnavailableException;
import com.cineverse.model.Booking;
import com.cineverse.model.BookingEvent;
import com.cineverse.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    @Autowired
    private BookingRepository bookingRepository;

    // Day 08: RabbitMQ Producer — injected for event publishing
    @Autowired
    private BookingEventProducer eventProducer;

    // In-memory seat lock store (simulates Redis lock at service level)
    // Day 07: In production, this is replaced by RedisTemplate
    private Set<String> lockedSeats = new HashSet<>();

    /**
     * Create a booking and publish a BOOKING_CONFIRMED event.
     *
     * Day 08 Academic Insight:
     * After saving the booking, we publish an event to RabbitMQ.
     * The consumer will ASYNCHRONOUSLY handle: email, analytics, loyalty.
     *
     * @param booking The booking to create
     * @return Saved booking with CONFIRMED status
     */
    public Booking createBooking(Booking booking) {
        // Validate seats are provided
        if (booking.getSeatIds() == null || booking.getSeatIds().isEmpty()) {
            throw new IllegalArgumentException("Seat list cannot be empty");
        }

        // Check for seat conflicts (double-booking prevention)
        for (String seatId : booking.getSeatIds()) {
            if (lockedSeats.contains(seatId)) {
                throw new SeatUnavailableException("Seat " + seatId + " is already booked");
            }
        }

        // Lock seats to prevent race conditions
        lockedSeats.addAll(booking.getSeatIds());

        // Set booking status
        booking.setStatus("CONFIRMED");

        // Save to database (PostgreSQL via JPA)
        Booking saved = bookingRepository.save(booking);

        log.info("[BookingService] Booking #{} confirmed for show {} seats {}",
            saved.getId(), saved.getShowId(), saved.getSeatIds());

        // ── Day 08: Publish Event to RabbitMQ ─────────────────
        // Academic Insight: We publish AFTER saving — this ensures
        // data consistency. Even if RabbitMQ fails, booking is saved.
        BookingEvent event = new BookingEvent(
            saved.getId(),
            saved.getShowId(),
            saved.getSeatIds(),
            "CONFIRMED",
            "user_" + System.currentTimeMillis(), // In production: from JWT token
            null                                   // In production: from user profile
        );
        eventProducer.publishBookingEvent(event);

        return saved;
    }

    /**
     * Book a single seat by ID.
     * Used for unit test demonstrations (Day 09).
     *
     * @param seatId The seat to lock
     */
    public void bookSeat(String seatId) {
        if (lockedSeats.contains(seatId)) {
            throw new SeatUnavailableException("Seat " + seatId + " is already booked");
        }
        lockedSeats.add(seatId);
    }

    /**
     * Simple addition utility method.
     * Included for unit test demonstration (Day 09 slides).
     *
     * @param a First number
     * @param b Second number
     * @return Sum
     */
    public int add(int a, int b) {
        return a + b;
    }
}
