package com.cineverse.service;

// ============================================================
//  BookingEventProducer.java — RabbitMQ Message Producer
//  Day 08: RabbitMQ & Event-Driven Architecture
// ============================================================
//
//  Academic Insight: Producer
//  A Producer is a component that PUBLISHES messages to an
//  Exchange. It does NOT know which consumers will receive them.
//
//  Flow:
//  BookingService calls publishBookingEvent()
//       │
//       ▼
//  RabbitTemplate.convertAndSend(exchange, routingKey, event)
//       │
//       ▼
//  RabbitMQ Exchange routes message to Queue
//       │
//       ▼
//  Consumer (BookingEventConsumer) receives message
//
//  Why async?
//  BookingService returns a response to the user IMMEDIATELY
//  without waiting for the email/notification to be sent.
//  This improves response time and decouples concerns.
// ============================================================

import com.cineverse.config.RabbitMQConfig;
import com.cineverse.model.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BookingEventProducer {

    private static final Logger log = LoggerFactory.getLogger(BookingEventProducer.class);

    // RabbitTemplate is the main class for sending messages
    // Injected by Spring Boot (configured in RabbitMQConfig)
    @Autowired
    private RabbitTemplate rabbitTemplate;

    /**
     * Publish a booking event to the RabbitMQ exchange.
     *
     * Academic Insight:
     * convertAndSend() does two things:
     *   1. Converts BookingEvent → JSON (via Jackson2JsonMessageConverter)
     *   2. Sends the JSON to the specified exchange with the routing key
     *
     * RabbitMQ then routes the message to the appropriate queue
     * based on the routing key binding.
     *
     * @param event The booking event to publish
     */
    public void publishBookingEvent(BookingEvent event) {
        try {
            log.info("[RabbitMQ Producer] Publishing event: type={}, bookingId={}, seats={}",
                event.getEventType(), event.getBookingId(), event.getSeatIds());

            // convertAndSend(exchange, routingKey, payload)
            // Exchange: BOOKING_EXCHANGE
            // Routing key: BOOKING_ROUTING_KEY ("booking.confirmed")
            // Payload: BookingEvent (auto-converted to JSON)
            rabbitTemplate.convertAndSend(
                RabbitMQConfig.BOOKING_EXCHANGE,
                RabbitMQConfig.BOOKING_ROUTING_KEY,
                event
            );

            log.info("[RabbitMQ Producer] Event published successfully for bookingId={}",
                event.getBookingId());

        } catch (AmqpException ex) {
            // Academic Insight: Producer failures should be logged
            // but should NOT cause the booking to fail.
            // The booking is already saved — the event is best-effort.
            log.error("[RabbitMQ Producer] Failed to publish event for bookingId={}: {}",
                event.getBookingId(), ex.getMessage());
        }
    }
}
