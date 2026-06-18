package com.cineverse.model;

// ============================================================
//  BookingEvent.java — Event Model
//  Day 08: RabbitMQ & Event-Driven Architecture
// ============================================================
//
//  Academic Insight: Event-Driven Architecture (EDA)
//  Instead of direct method calls between services, services
//  communicate via events (messages).
//
//  Event Flow:
//  1. User confirms booking
//  2. BookingService publishes BookingEvent to RabbitMQ
//  3. NotificationService CONSUMES the event → sends email/SMS
//  4. BookingService doesn't wait — it's ASYNCHRONOUS
//
//  Why use an Event object?
//  - Carries all info needed by consumers
//  - Decoupled: producer doesn't know about consumer
//  - Serialized to JSON for transport over RabbitMQ
// ============================================================

import java.time.LocalDateTime;
import java.util.List;

public class BookingEvent {

    // ── Event Metadata ───────────────────────────────────────
    // Academic Insight: Every event should have a type and timestamp
    // so consumers can route and audit events correctly
    private String eventType;          // e.g., "BOOKING_CONFIRMED"
    private LocalDateTime eventTime;   // When the event was created

    // ── Booking Details ──────────────────────────────────────
    private Long bookingId;
    private String showId;
    private List<String> seatIds;
    private String status;             // CONFIRMED, CANCELLED, PENDING

    // ── User Details (for notification) ─────────────────────
    private String userId;
    private String userEmail;          // Notification consumer sends email here

    // ─────────────────────────────────────────────────────────
    //  Constructors
    // ─────────────────────────────────────────────────────────

    // No-arg constructor required for Jackson JSON deserialization
    public BookingEvent() {}

    public BookingEvent(Long bookingId, String showId, List<String> seatIds,
                        String status, String userId, String userEmail) {
        this.bookingId = bookingId;
        this.showId    = showId;
        this.seatIds   = seatIds;
        this.status    = status;
        this.userId    = userId;
        this.userEmail = userEmail;
        this.eventType = "BOOKING_" + status;   // e.g., BOOKING_CONFIRMED
        this.eventTime = LocalDateTime.now();
    }

    // ─────────────────────────────────────────────────────────
    //  Getters and Setters (required by Jackson)
    // ─────────────────────────────────────────────────────────

    public String getEventType()              { return eventType; }
    public void setEventType(String eventType){ this.eventType = eventType; }

    public LocalDateTime getEventTime()                    { return eventTime; }
    public void setEventTime(LocalDateTime eventTime)      { this.eventTime = eventTime; }

    public Long getBookingId()               { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getShowId()             { return showId; }
    public void setShowId(String showId)  { this.showId = showId; }

    public List<String> getSeatIds()               { return seatIds; }
    public void setSeatIds(List<String> seatIds)   { this.seatIds = seatIds; }

    public String getStatus()              { return status; }
    public void setStatus(String status)   { this.status = status; }

    public String getUserId()              { return userId; }
    public void setUserId(String userId)   { this.userId = userId; }

    public String getUserEmail()               { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    @Override
    public String toString() {
        return "BookingEvent{" +
            "eventType='" + eventType + '\'' +
            ", bookingId=" + bookingId +
            ", showId='" + showId + '\'' +
            ", seatIds=" + seatIds +
            ", status='" + status + '\'' +
            ", eventTime=" + eventTime +
            '}';
    }
}
