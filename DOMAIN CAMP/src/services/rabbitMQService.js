/**
 * ============================================================
 *  rabbitMQService.js — Frontend RabbitMQ Simulation (Day 8)
 * ============================================================
 *
 *  Simulates RabbitMQ Producer-Consumer pattern in the browser.
 *  In the real Spring Boot backend:
 *    - Producer: BookingEventProducer (RabbitTemplate.convertAndSend)
 *    - Queue:    booking.queue (RabbitMQ broker)
 *    - Consumer: BookingEventConsumer (@RabbitListener)
 *
 *  Academic Insight:
 *  RabbitMQ components modeled here:
 *  ┌──────────────────────────────────────────────────────────┐
 *  │  Exchange: routes messages to queues by routing key      │
 *  │  Queue:    stores messages until consumed                │
 *  │  Consumer: picks up and processes messages               │
 *  │  DLQ:      receives messages that fail processing        │
 *  └──────────────────────────────────────────────────────────┘
 *
 *  Event Types:
 *  - BOOKING_CONFIRMED → consumer sends email + awards points
 *  - BOOKING_CANCELLED → consumer processes refund
 * ============================================================
 */

const RABBITMQ_STORE_KEY = 'cineverse_rabbitmq_events';
const MAX_EVENTS = 50; // Keep last 50 events (like a bounded queue)

// ── Simulated Exchange Configuration ────────────────────────
export const EXCHANGE = {
  name: 'booking.exchange',
  type: 'direct',
  queues: ['booking.queue'],
  dlq: 'booking.dlq',
};

/**
 * Load all events from the simulated queue store.
 */
const loadStore = () => {
  try {
    const raw = localStorage.getItem(RABBITMQ_STORE_KEY);
    return raw ? JSON.parse(raw) : { events: [], dlqEvents: [] };
  } catch {
    return { events: [], dlqEvents: [] };
  }
};

const saveStore = (store) => {
  localStorage.setItem(RABBITMQ_STORE_KEY, JSON.stringify(store));
};

/**
 * PRODUCER: Publish a booking event to the exchange.
 *
 * Simulates:
 *   rabbitTemplate.convertAndSend(exchange, routingKey, event)
 *
 * @param {Object} booking - The booking data
 * @returns {Object} The published event
 */
export const publishBookingEvent = (booking) => {
  const event = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    eventType: `BOOKING_${booking.status || 'CONFIRMED'}`,
    routingKey: 'booking.confirmed',
    exchange: EXCHANGE.name,
    queue: 'booking.queue',
    bookingId: booking.id || booking.bookingId || Date.now(),
    showId: booking.showId,
    seatIds: booking.seatIds || [],
    status: booking.status || 'CONFIRMED',
    userId: booking.userId || 'user_demo',
    publishedAt: new Date().toISOString(),
    processingStatus: 'QUEUED',    // QUEUED → PROCESSING → PROCESSED | FAILED
    retryCount: 0,
  };

  const store = loadStore();
  store.events = [event, ...store.events].slice(0, MAX_EVENTS);
  saveStore(store);

  console.log(`[RabbitMQ Producer] Published event: ${event.eventType} (id: ${event.id})`);

  // Simulate asynchronous consumer processing (delay = network + processing time)
  setTimeout(() => consumeEvent(event.id), 800 + Math.random() * 1200);

  return event;
};

/**
 * CONSUMER: Process an event from the queue.
 *
 * Simulates:
 *   @RabbitListener(queues = "booking.queue")
 *   public void handleBookingEvent(BookingEvent event) { ... }
 *
 * @param {string} eventId
 */
const consumeEvent = (eventId) => {
  const store = loadStore();
  const eventIdx = store.events.findIndex((e) => e.id === eventId);
  if (eventIdx === -1) return;

  const event = store.events[eventIdx];
  event.processingStatus = 'PROCESSING';
  event.processingStartedAt = new Date().toISOString();
  saveStore(store);

  // Simulate processing (email, analytics, etc.)
  setTimeout(() => {
    const updatedStore = loadStore();
    const idx = updatedStore.events.findIndex((e) => e.id === eventId);
    if (idx === -1) return;

    // Simulate 5% failure rate (to demonstrate DLQ)
    const shouldFail = Math.random() < 0.05;

    if (shouldFail && updatedStore.events[idx].retryCount < 3) {
      updatedStore.events[idx].retryCount += 1;
      updatedStore.events[idx].processingStatus = 'RETRYING';
      updatedStore.events[idx].lastError = 'Simulated transient failure';
      saveStore(updatedStore);
      // Retry after delay
      setTimeout(() => consumeEvent(eventId), 2000);
    } else if (shouldFail) {
      // Moved to DLQ after 3 retries
      updatedStore.events[idx].processingStatus = 'DEAD_LETTERED';
      updatedStore.events[idx].processedAt = new Date().toISOString();
      updatedStore.dlqEvents = [updatedStore.events[idx], ...updatedStore.dlqEvents].slice(0, 20);
      saveStore(updatedStore);
      console.log(`[RabbitMQ DLQ] Event ${eventId} moved to Dead Letter Queue`);
    } else {
      // Success
      updatedStore.events[idx].processingStatus = 'PROCESSED';
      updatedStore.events[idx].processedAt = new Date().toISOString();
      updatedStore.events[idx].consumerActions = getConsumerActions(updatedStore.events[idx].eventType);
      saveStore(updatedStore);
      console.log(`[RabbitMQ Consumer] Event ${eventId} processed successfully`);
    }
  }, 500 + Math.random() * 1000);
};

/**
 * Get simulated consumer actions for display.
 */
const getConsumerActions = (eventType) => {
  if (eventType === 'BOOKING_CONFIRMED') {
    return [
      '✉️ Confirmation email sent',
      '📊 Analytics recorded',
      '⭐ Loyalty points awarded',
    ];
  }
  if (eventType === 'BOOKING_CANCELLED') {
    return [
      '✉️ Cancellation email sent',
      '💰 Refund initiated',
      '🔓 Seats released',
    ];
  }
  return ['✅ Event processed'];
};

/**
 * Get all events from the queue store.
 */
export const getQueueEvents = () => {
  return loadStore().events;
};

/**
 * Get all Dead Letter Queue events.
 */
export const getDLQEvents = () => {
  return loadStore().dlqEvents;
};

/**
 * Clear all events (for testing).
 */
export const clearQueue = () => {
  saveStore({ events: [], dlqEvents: [] });
  console.log('[RabbitMQ] Queue cleared');
};

export default {
  publishBookingEvent,
  getQueueEvents,
  getDLQEvents,
  clearQueue,
  EXCHANGE,
};
