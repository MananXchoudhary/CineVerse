package com.cineverse.service;

// ============================================================
//  BookingEventConsumer.java — RabbitMQ Message Consumer
//  Day 08: RabbitMQ & Event-Driven Architecture
// ============================================================
//
//  Academic Insight: Consumer / Listener
//  A Consumer LISTENS to a queue and processes messages.
//  @RabbitListener makes this method run automatically whenever
//  a new message arrives in the queue — like an event handler.
//
//  Producer-Consumer Pattern:
//  Producer (BookingService) → Queue → Consumer (This class)
//
//  Asynchronous Flow:
//  1. Booking created → event published to queue
//  2. Consumer picks up event INDEPENDENTLY
//  3. Simulates: send email, update analytics, trigger notification
//
//  Dead Letter Queue (DLQ):
//  If processing fails 3 times → message moved to booking.dlq
//  Operations team can inspect DLQ for failed events.
//
//  Retry Mechanism:
//  Spring AMQP automatically retries failed messages.
//  Configure in application.properties:
//    spring.rabbitmq.listener.simple.retry.enabled=true
//    spring.rabbitmq.listener.simple.retry.max-attempts=3
// ============================================================

import com.cineverse.config.RabbitMQConfig;
import com.cineverse.model.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class BookingEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(BookingEventConsumer.class);

    /**
     * Process a booking event from the main booking queue.
     *
     * Academic Insight:
     * @RabbitListener makes this method a message consumer.
     * When a BookingEvent arrives in booking.queue, Spring AMQP:
     *   1. Deserializes JSON → BookingEvent (via Jackson)
     *   2. Calls this method with the deserialized object
     *   3. If successful → message is ACKed (removed from queue)
     *   4. If exception → message is NACKed (retried or sent to DLQ)
     *
     * @param event The BookingEvent received from the queue
     */
    @RabbitListener(queues = RabbitMQConfig.BOOKING_QUEUE)
    public void handleBookingEvent(BookingEvent event) {
        log.info("[RabbitMQ Consumer] Received event: type={}, bookingId={}, seats={}",
            event.getEventType(), event.getBookingId(), event.getSeatIds());

        try {
            // ── Step 1: Process based on event type ────────────
            switch (event.getEventType()) {
                case "BOOKING_CONFIRMED":
                    processBookingConfirmed(event);
                    break;
                case "BOOKING_CANCELLED":
                    processBookingCancelled(event);
                    break;
                default:
                    log.warn("[RabbitMQ Consumer] Unknown event type: {}", event.getEventType());
            }

            log.info("[RabbitMQ Consumer] Successfully processed event for bookingId={}",
                event.getBookingId());

        } catch (Exception ex) {
            // If exception is thrown → Spring AMQP NACKs the message
            // After max retries → message goes to DLQ
            log.error("[RabbitMQ Consumer] Failed to process event for bookingId={}: {}",
                event.getBookingId(), ex.getMessage());
            throw ex; // Re-throw to trigger retry/DLQ mechanism
        }
    }

    /**
     * Handle confirmed booking:
     * - Send confirmation email (simulated)
     * - Update analytics
     * - Trigger loyalty points
     *
     * @param event
     */
    private void processBookingConfirmed(BookingEvent event) {
        // ── Simulate: Send confirmation email ──────────────────
        // In production: integrate with SendGrid, SES, or SMTP
        log.info("[RabbitMQ Consumer] Sending confirmation email to {} for booking #{}",
            event.getUserEmail() != null ? event.getUserEmail() : "user@cineverse.com",
            event.getBookingId());

        // ── Simulate: Record analytics ─────────────────────────
        log.info("[RabbitMQ Consumer] Recording analytics: showId={}, seats={}, time={}",
            event.getShowId(), event.getSeatIds(), event.getEventTime());

        // ── Simulate: Award loyalty points ─────────────────────
        log.info("[RabbitMQ Consumer] Awarding {} loyalty points to user {}",
            event.getSeatIds() != null ? event.getSeatIds().size() * 10 : 0,
            event.getUserId());
    }

    /**
     * Handle cancelled booking:
     * - Send cancellation email
     * - Release seats
     * - Process refund
     *
     * @param event
     */
    private void processBookingCancelled(BookingEvent event) {
        log.info("[RabbitMQ Consumer] Processing cancellation for booking #{}",
            event.getBookingId());

        // ── Simulate: Send cancellation email ──────────────────
        log.info("[RabbitMQ Consumer] Sending cancellation email to {} for booking #{}",
            event.getUserEmail() != null ? event.getUserEmail() : "user@cineverse.com",
            event.getBookingId());

        // ── Simulate: Process refund ────────────────────────────
        log.info("[RabbitMQ Consumer] Processing refund for booking #{}",
            event.getBookingId());
    }

    /**
     * Dead Letter Queue Consumer.
     * Processes messages that have FAILED multiple times.
     *
     * Academic Insight:
     * DLQ is critical in production — it prevents message loss.
     * Operations team monitors DLQ for failed events and can
     * manually requeue them after fixing the underlying issue.
     *
     * @param event Failed booking event
     */
    @RabbitListener(queues = RabbitMQConfig.BOOKING_DLQ)
    public void handleDeadLetterEvent(BookingEvent event) {
        log.error("[RabbitMQ DLQ] Dead Letter received for bookingId={}, eventType={}",
            event.getBookingId(), event.getEventType());

        // In production:
        // - Alert operations team (PagerDuty, Slack)
        // - Store in error log database for manual review
        // - Send alert email to admin
        log.error("[RabbitMQ DLQ] Manual intervention required for booking #{}",
            event.getBookingId());
    }
}
