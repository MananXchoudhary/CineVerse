package com.cineverse.config;

// ============================================================
//  RabbitMQConfig.java — RabbitMQ Configuration
//  Day 08: RabbitMQ & Event-Driven Architecture
// ============================================================
//
//  Academic Insight: Message Broker Architecture
//  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
//  │   Producer   │───▶│   Exchange   │───▶│    Queue     │
//  │ (BookingService)   │ (booking.ex) │    │(booking.q)   │
//  └──────────────┘    └──────────────┘    └──────┬───────┘
//                                                 │
//                                          ┌──────▼───────┐
//                                          │   Consumer   │
//                                          │(EventConsumer)│
//                                          └──────────────┘
//
//  Components:
//  - Exchange: Routes messages to queues by routing key
//  - Queue: Stores messages until a consumer processes them
//  - Binding: Connects exchange to queue via routing key
//  - DLQ (Dead Letter Queue): Stores failed/unprocessable messages
//
//  Why RabbitMQ?
//  - Decoupling: BookingService doesn't wait for email service
//  - Fault Tolerance: If email service is down, messages wait in queue
//  - Scalability: Multiple consumers can process messages in parallel
//  - Retries: Failed messages go to DLQ for later inspection
// ============================================================

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ── Queue and Exchange Names ─────────────────────────────
    // Academic Insight: Use constants to avoid typos in queue names
    public static final String BOOKING_QUEUE         = "booking.queue";
    public static final String BOOKING_EXCHANGE      = "booking.exchange";
    public static final String BOOKING_ROUTING_KEY   = "booking.confirmed";

    // Dead Letter Queue — receives messages that fail processing
    public static final String BOOKING_DLQ           = "booking.dlq";
    public static final String BOOKING_DL_EXCHANGE   = "booking.dlx";
    public static final String BOOKING_DL_ROUTING_KEY = "booking.dead";

    // ── Dead Letter Exchange (DLX) ───────────────────────────
    // Messages that fail 3 times → routed here automatically
    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(BOOKING_DL_EXCHANGE);
    }

    // ── Dead Letter Queue ────────────────────────────────────
    // Stores failed messages for inspection / manual retry
    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(BOOKING_DLQ).build();
    }

    // ── DLQ Binding ──────────────────────────────────────────
    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder
            .bind(deadLetterQueue())
            .to(deadLetterExchange())
            .with(BOOKING_DL_ROUTING_KEY);
    }

    // ── Main Booking Queue ───────────────────────────────────
    // durable(true) = queue survives RabbitMQ restart
    // x-dead-letter-exchange = failed messages go to DLX
    @Bean
    public Queue bookingQueue() {
        return QueueBuilder.durable(BOOKING_QUEUE)
            .withArgument("x-dead-letter-exchange", BOOKING_DL_EXCHANGE)
            .withArgument("x-dead-letter-routing-key", BOOKING_DL_ROUTING_KEY)
            .withArgument("x-message-ttl", 60000)   // 60s message TTL
            .build();
    }

    // ── Main Exchange ────────────────────────────────────────
    // DirectExchange routes messages by exact routing key match
    // Alternative: TopicExchange (wildcard), FanoutExchange (broadcast)
    @Bean
    public DirectExchange bookingExchange() {
        return new DirectExchange(BOOKING_EXCHANGE);
    }

    // ── Binding ──────────────────────────────────────────────
    // Connects Exchange → Queue for a specific routing key
    // Academic: Without binding, messages are lost!
    @Bean
    public Binding bookingBinding() {
        return BindingBuilder
            .bind(bookingQueue())
            .to(bookingExchange())
            .with(BOOKING_ROUTING_KEY);
    }

    // ── JSON Message Converter ───────────────────────────────
    // Converts Java objects (BookingEvent) to JSON automatically
    // Without this: messages are serialized as Java byte streams
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // ── RabbitTemplate ───────────────────────────────────────
    // Main class used by producers to send messages
    // Equivalent to JdbcTemplate for databases
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
