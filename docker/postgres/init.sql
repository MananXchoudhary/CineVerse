-- ============================================================
--  init.sql — PostgreSQL Initialization Script
--  Day 10: Docker & Containerization
-- ============================================================
--
--  Academic Insight: DB Initialization in Docker
--  This script runs ONCE on first container start (when the
--  postgres_data volume is empty / fresh).
--
--  PostgreSQL docker image looks for .sql files in:
--    /docker-entrypoint-initdb.d/
--  and executes them in alphabetical order.
--
--  In Spring Boot, JPA/Hibernate handles schema creation via:
--    spring.jpa.hibernate.ddl-auto=create-drop
--  But this script ensures the DB and user exist first.
-- ============================================================

-- Create the bookings table (Hibernate will also do this,
-- but having it here documents the schema explicitly)
CREATE TABLE IF NOT EXISTS bookings (
    id          BIGSERIAL PRIMARY KEY,
    show_id     VARCHAR(50) NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
);

-- ElementCollection table for seatIds (List<String>)
CREATE TABLE IF NOT EXISTS bookings_seat_ids (
    booking_id  BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_ids    VARCHAR(10) NOT NULL
);

-- Index for faster lookups by show_id
CREATE INDEX IF NOT EXISTS idx_bookings_show_id ON bookings(show_id);

-- Seed some sample data for demonstration
INSERT INTO bookings (show_id, status) VALUES ('SH-DEMO-1', 'CONFIRMED') ON CONFLICT DO NOTHING;
