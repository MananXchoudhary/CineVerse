package com.cineverse.controller;

import com.cineverse.model.Booking;
import com.cineverse.service.BookingService;
import com.cineverse.exception.SeatUnavailableException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * ============================================================
 *  BookingControllerTest — Day 09: Controller Testing
 * ============================================================
 *
 *  Uses @WebMvcTest to test the HTTP layer in isolation.
 *  BookingService is mocked using @MockBean (Mockito).
 *
 *  Academic Insight:
 *  @WebMvcTest loads ONLY the web layer (controllers, filters),
 *  making tests fast without starting a full Spring context.
 *  MockMvc simulates HTTP requests without a running server.
 * ============================================================
 */
@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    // ─────────────────────────────────────────────────────────
    // Test 1: Happy Path — Successful Booking
    // Expected: 200 OK with booking object in response
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_Success() throws Exception {
        Booking booking = new Booking("SH1", Arrays.asList("A1", "A2"));
        booking.setId(1L);
        booking.setStatus("CONFIRMED");

        when(bookingService.createBooking(any(Booking.class))).thenReturn(booking);

        mockMvc.perform(post("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"showId\": \"SH1\", \"seatIds\": [\"A1\", \"A2\"]}"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(1L))
               .andExpect(jsonPath("$.status").value("CONFIRMED"))
               .andExpect(jsonPath("$.showId").value("SH1"));
    }

    // ─────────────────────────────────────────────────────────
    // Test 2: Edge Case — Empty Seat List
    // Expected: 400 Bad Request with error message
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_EmptySeatList() throws Exception {
        when(bookingService.createBooking(any(Booking.class)))
            .thenThrow(new IllegalArgumentException("Seat list cannot be empty"));

        mockMvc.perform(post("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"showId\": \"SH2\", \"seatIds\": []}"))
               .andExpect(status().isBadRequest())
               .andExpect(content().string("Seat list cannot be empty"));
    }

    // ─────────────────────────────────────────────────────────
    // Test 3: Exception Case — Seat Already Booked
    // Expected: 400 Bad Request (SeatUnavailableException caught)
    // Academic Insight: Exception testing ensures robust error handling
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_SeatAlreadyBooked() throws Exception {
        when(bookingService.createBooking(any(Booking.class)))
            .thenThrow(new SeatUnavailableException("Seat A1 is already booked"));

        mockMvc.perform(post("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"showId\": \"SH1\", \"seatIds\": [\"A1\"]}"))
               .andExpect(status().isBadRequest())
               .andExpect(content().string("Seat A1 is already booked"));
    }

    // ─────────────────────────────────────────────────────────
    // Test 4: Edge Case — Request with Single Seat
    // Expected: 200 OK (valid minimal booking)
    // ─────────────────────────────────────────────────────────
    @Test
    void testCreateBooking_SingleSeat() throws Exception {
        Booking booking = new Booking("SH3", Arrays.asList("B1"));
        booking.setId(2L);
        booking.setStatus("CONFIRMED");

        when(bookingService.createBooking(any(Booking.class))).thenReturn(booking);

        mockMvc.perform(post("/booking")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"showId\": \"SH3\", \"seatIds\": [\"B1\"]}"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.id").value(2L));
    }
}
