import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { movieService, bookingService, theatreService, showService } from '../../services/api';
import {
  lockSeat,
  releaseSeat,
  releaseAllSeats,
  isSeatAvailable,
  getLockedSeats,
  getSeatLockTTL,
  buildShowKey,
} from '../../services/seatLockService';
import { redisGetAllEntries } from '../../services/redisCache';
// Day 08: RabbitMQ Event-Driven Architecture
import { publishBookingEvent } from '../../services/rabbitMQService';

import {
  Calendar, Clock, MapPin, Film, ChevronLeft, CreditCard,
  CheckCircle2, Database, Zap, Lock, Unlock, RefreshCw,
  ChevronDown, ChevronUp, Server, AlertTriangle, Building2,
} from 'lucide-react';
import './Booking.css';

export const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cacheHit, setCacheHit] = useState(null); // null = loading, true = hit, false = miss

  // Date & Showtime States — now driven by dynamic shows
  const dates = ['Today, June 10', 'Tomorrow, June 11', 'Wednesday, June 12'];
  const times = ['12:30 PM', '03:45 PM', '07:00 PM', '09:45 PM'];
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState(times[2]);

  // Day 06 — Theatre & Screen selection state
  const [theatres, setTheatres] = useState([]);         // all theatres
  const [shows, setShows] = useState([]);               // shows for this movie
  const [selectedTheatre, setSelectedTheatre] = useState(null);  // { theatreId, name, screens[] }
  const [selectedScreen, setSelectedScreen] = useState(null);    // { screenId, name, type }
  const [availableTimes, setAvailableTimes] = useState(times);   // times for selected theatre+date

  // Day 06 — Past booked seats (from confirmed bookings in localStorage)
  const [bookedSeats, setBookedSeats] = useState([]);   // seats already confirmed (permanently unavailable)

  // Seat Selection State
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Redis-powered seat lock state
  const [lockedByOthers, setLockedByOthers] = useState([]); // seats locked by others (shown orange)
  const [seatTTLs, setSeatTTLs] = useState({}); // { seatName: ttlSeconds }
  const [redisEntries, setRedisEntries] = useState([]); // for the Redis panel
  const [showRedisPanel, setShowRedisPanel] = useState(false);

  // Ticker ref for TTL countdowns
  const tickerRef = useRef(null);

  // Seat Grid Configuration
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const seatsPerRow = 10;

  // Static Reserved/Occupied Seats (permanently booked)
  const reservedSeats = ['A3', 'A4', 'B8', 'B9', 'C5', 'C6', 'E1', 'E2', 'F7', 'F8', 'G5', 'H10'];

  // Pricing based on rows
  const getSeatPrice = (seatName) => {
    const row = seatName.charAt(0);
    if (['G', 'H'].includes(row)) return 500;
    if (['D', 'E', 'F'].includes(row)) return 350;
    return 250;
  };

  const getSeatCategory = (seatName) => {
    const row = seatName.charAt(0);
    if (['G', 'H'].includes(row)) return 'VIP';
    if (['D', 'E', 'F'].includes(row)) return 'Deluxe';
    return 'Standard';
  };

  // Build show key for Redis locking — includes theatre+screen scope (Day 06)
  const getShowKey = useCallback(() => {
    if (!movie) return '';
    const thId = selectedTheatre?.theatreId || 'default';
    const scId = selectedScreen?.screenId || 'default';
    return buildShowKey(`${movie.id}-${thId}-${scId}`, selectedDate, selectedTime);
  }, [movie, selectedTheatre, selectedScreen, selectedDate, selectedTime]);

  // Sync Redis state → local state (locks, TTLs, panel entries)
  const syncRedisState = useCallback(() => {
    const showKey = getShowKey();
    if (!showKey) return;

    // Get all locked seats for this show
    const locked = getLockedSeats(showKey);
    const lockedByOthersSeats = locked
      .filter((l) => l.lockedBy !== 'current_user')
      .map((l) => l.seatNumber);

    setLockedByOthers(lockedByOthersSeats);

    // Update TTLs for selected seats
    const ttls = {};
    selectedSeats.forEach((seat) => {
      const ttl = getSeatLockTTL(showKey, seat);
      if (ttl > 0) ttls[seat] = ttl;
    });
    setSeatTTLs(ttls);

    // Update Redis panel entries
    setRedisEntries(redisGetAllEntries());
  }, [getShowKey, selectedSeats]);

  // Fetch movie data using Cache-Aside pattern
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const result = await movieService.getMovies();
        const moviesList = result.data || result;
        const foundMovie = moviesList.find((m) => m.id === id);
        setMovie(foundMovie || moviesList[0]);
        setCacheHit(result.cacheHit ?? null);
      } catch (e) {
        console.error('Error fetching movie details', e);
        setCacheHit(false);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieDetails();
  }, [id]);

  // Day 06 — Load theatres and shows for this movie
  useEffect(() => {
    const fetchTheatresAndShows = async () => {
      try {
        const [theatreList, showList] = await Promise.all([
          theatreService.getTheatres(),
          showService.getShowsByMovie(id),
        ]);
        setTheatres(theatreList);
        setShows(showList);
        // Auto-select first theatre that has shows for this movie
        if (theatreList.length > 0 && showList.length > 0) {
          const firstTheatreWithShow = theatreList.find(
            (t) => showList.some((s) => s.theatreId === t.theatreId)
          );
          if (firstTheatreWithShow) {
            setSelectedTheatre(firstTheatreWithShow);
            setSelectedScreen(firstTheatreWithShow.screens[0]);
          }
        }
      } catch (e) {
        console.error('Error fetching theatres/shows', e);
      }
    };
    if (id) fetchTheatresAndShows();
  }, [id]);

  // Day 06 — When theatre+date changes, update available times from show schedule
  useEffect(() => {
    if (!selectedTheatre || !selectedScreen || shows.length === 0) return;
    const filtered = shows.filter(
      (s) => s.theatreId === selectedTheatre.theatreId &&
             s.screenId  === selectedScreen.screenId  &&
             s.date       === selectedDate
    );
    const times = filtered.map((s) => s.startTime);
    setAvailableTimes(times.length > 0 ? times : ['No shows scheduled']);
    if (times.length > 0) setSelectedTime(times[0]);
  }, [selectedTheatre, selectedScreen, selectedDate, shows]);

  // Day 06 — Load booked seats for current show from past confirmed bookings
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cineverse_bookings_in_2026');
      const allBookings = stored ? JSON.parse(stored) : [];
      // Collect seats from bookings that match this movie + date + time
      const booked = [];
      allBookings.forEach((b) => {
        if (
          b.movieId  === id &&
          b.date     === selectedDate &&
          b.time     === selectedTime &&
          b.status   === 'CONFIRMED'
        ) {
          booked.push(...(b.seats || []));
        }
      });
      setBookedSeats(booked);
    } catch (e) {
      setBookedSeats([]);
    }
  }, [id, selectedDate, selectedTime]);

  // Start TTL ticker once movie is loaded
  useEffect(() => {
    if (!movie) return;
    syncRedisState();

    tickerRef.current = setInterval(() => {
      syncRedisState();
    }, 1000); // tick every second for live countdowns

    return () => clearInterval(tickerRef.current);
  }, [movie, syncRedisState]);

  // Re-sync when date/time changes (different show = different lock scope)
  useEffect(() => {
    // Release locks from previous show when user switches
    syncRedisState();
  }, [selectedDate, selectedTime]);

  const handleSeatClick = (seatName) => {
    if (reservedSeats.includes(seatName)) return;
    if (bookedSeats.includes(seatName)) return;    // Day 06: BOOKED seats are permanently unavailable
    if (lockedByOthers.includes(seatName)) return; // cannot select locked seat

    const showKey = getShowKey();

    if (selectedSeats.includes(seatName)) {
      // Deselect → release Redis lock
      releaseSeat(showKey, seatName);
      setSelectedSeats((prev) => prev.filter((s) => s !== seatName));
    } else {
      // Attempt to acquire Redis lock (SET NX)
      const acquired = lockSeat(showKey, seatName, 'current_user');
      if (acquired) {
        setSelectedSeats((prev) => [...prev, seatName]);
      } else {
        // Another tab/user has it locked
        alert(`Seat ${seatName} is currently locked by another user. Please choose another seat.`);
      }
    }
    // Refresh Redis state immediately
    setTimeout(syncRedisState, 50);
  };

  const calculateTotalPrice = () =>
    selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat), 0);

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) return;
    setSubmitting(true);

    const showKey = getShowKey();
    const bookingDetails = {
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      date: selectedDate,
      time: selectedTime,
      seats: selectedSeats,
      totalPrice: calculateTotalPrice(),
      // Day 06: Include theatre + screen in booking record
      theatreId:   selectedTheatre?.theatreId  || 'TH-001',
      theatreName: selectedTheatre?.name       || 'PVR Cinemas',
      screenId:    selectedScreen?.screenId   || 'SC-001-1',
      screenName:  selectedScreen?.name       || 'Screen 1',
      // Day 06: FSM initial status — will be set to CONFIRMED by API
      status: 'INITIATED',
    };

    try {
      const result = await bookingService.createBooking(bookingDetails);

      // Release all seat locks on successful booking (cache invalidation)
      releaseAllSeats(showKey, selectedSeats);
      console.log('[Cache] Seat locks released after booking confirmation');

      // ── Day 08: Publish Booking Event to RabbitMQ ───────────
      // Academic Insight: After booking is saved, publish an event.
      // Consumer will ASYNCHRONOUSLY: send email, award loyalty points.
      // Producer does NOT wait for consumer — it's fire-and-forget.
      publishBookingEvent({
        id: result?.id || Date.now(),
        showId: `${bookingDetails.movieId}-${bookingDetails.date}-${bookingDetails.time}`,
        seatIds: selectedSeats,
        status: 'CONFIRMED',
        userId: 'user_current',
      });
      console.log('[RabbitMQ] BookingConfirmed event published to booking.exchange');


      setTimeout(() => {
        setBookingConfirmed(result);
        setSubmitting(false);
      }, 1000);
    } catch (e) {
      console.error('Booking confirmation failed', e);
      setSubmitting(false);
      alert('Failed to process booking, please try again.');
    }
  };

  // Format TTL as MM:SS
  const formatTTL = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── Loading State ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="loader-container flex-center" style={{ minHeight: '60vh' }}>
        <span className="spinner-small"></span>
      </div>
    );
  }

  // ── Booking Success / Ticket ───────────────────────────────
  if (bookingConfirmed) {
    return (
      <div className="booking-success-container container flex-center">
        <div className="ticket-card glass-panel text-center">
          <div className="success-icon flex-center">
            <CheckCircle2 size={40} className="icon" />
          </div>
          <h2>Booking Confirmed!</h2>
          <p className="success-msg">
            Your ticket has been generated. Seat locks released from Redis — seats are now available for others.
          </p>

          <div className="digital-ticket">
            <div className="ticket-top">
              <h3>{bookingConfirmed.movieTitle}</h3>
              <p className="ticket-tagline">Show this ticket at the cinema hall entrance</p>
            </div>

            <div className="ticket-divider flex-center">
              <div className="notch left"></div>
              <div className="dash-line"></div>
              <div className="notch right"></div>
            </div>

            <div className="ticket-body">
              <div className="ticket-details grid">
                <div className="ticket-detail-item">
                  <span className="lbl">Ticket Code</span>
                  <span className="val code">{bookingConfirmed.id}</span>
                </div>
                <div className="ticket-detail-item">
                  <span className="lbl">Date</span>
                  <span className="val">{bookingConfirmed.date}</span>
                </div>
                <div className="ticket-detail-item">
                  <span className="lbl">Time</span>
                  <span className="val">{bookingConfirmed.time}</span>
                </div>
                <div className="ticket-detail-item">
                  <span className="lbl">Seats</span>
                  <span className="val">{bookingConfirmed.seats.join(', ')}</span>
                </div>
              </div>

              <div className="ticket-footer flex">
                <div className="price-item">
                  <span className="lbl">Total Paid</span>
                  <span className="val total">₹{bookingConfirmed.totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="barcode-wrapper flex-center">
                  <div className="barcode-line w-2"></div>
                  <div className="barcode-line w-4"></div>
                  <div className="barcode-line w-1"></div>
                  <div className="barcode-line w-3"></div>
                  <div className="barcode-line w-2"></div>
                  <div className="barcode-line w-5"></div>
                  <div className="barcode-line w-1"></div>
                  <div className="barcode-line w-3"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="success-actions flex">
            <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
            <Link to="/catalog" className="btn-secondary">Browse More Movies</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Booking Page ──────────────────────────────────────
  return (
    <div className="booking-page-container container">
      {/* Back Button */}
      <Link to="/catalog" className="back-link flex-center">
        <ChevronLeft size={16} /> Back to Movie Catalog
      </Link>

      {/* ── Cache Status Banner ── */}
      {cacheHit !== null && (
        <div className={`cache-status-banner ${cacheHit ? 'hit' : 'miss'}`}>
          {cacheHit ? (
            <>
              <Zap size={14} />
              <span>
                <strong>Redis Cache HIT</strong> — Movie data served instantly from in-memory cache (no DB call)
              </span>
              <span className="cache-badge hit-badge">⚡ CACHE HIT</span>
            </>
          ) : (
            <>
              <Database size={14} />
              <span>
                <strong>Cache MISS</strong> — Fetched from DB and stored in Redis (TTL: 300s)
              </span>
              <span className="cache-badge miss-badge">🗄 DB FETCH</span>
            </>
          )}
        </div>
      )}

      {/* ── Day 06: Theatre & Screen Selector ── */}
      <div className="theatre-screen-selector glass-panel">
        <div className="tss-header flex-center">
          <Building2 size={16} />
          <span>Select Theatre &amp; Screen</span>
          <span className="tss-badge">Day 06 — Theatre &amp; Screen Model</span>
        </div>

        <div className="tss-theatres flex">
          {theatres.map((theatre) => {
            const hasShow = shows.some(
              (s) => s.theatreId === theatre.theatreId && s.date === selectedDate
            );
            return (
              <button
                key={theatre.theatreId}
                type="button"
                className={`theatre-card ${
                  selectedTheatre?.theatreId === theatre.theatreId ? 'active' : ''
                } ${!hasShow ? 'no-show' : ''}`}
                onClick={() => {
                  setSelectedTheatre(theatre);
                  setSelectedScreen(theatre.screens[0]);
                  setSelectedSeats([]);
                }}
              >
                <span className="theatre-name">{theatre.name}</span>
                <span className="theatre-location flex-center">
                  <MapPin size={11} /> {theatre.location.split(',')[0]}
                </span>
                {!hasShow && <span className="no-show-label">No shows today</span>}
              </button>
            );
          })}
        </div>

        {selectedTheatre && (
          <div className="tss-screens flex">
            {selectedTheatre.screens.map((screen) => (
              <button
                key={screen.screenId}
                type="button"
                className={`screen-pill ${
                  selectedScreen?.screenId === screen.screenId ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedScreen(screen);
                  setSelectedSeats([]);
                }}
              >
                {screen.name}
                <span className={`screen-type-tag type-${screen.type.toLowerCase()}`}>
                  {screen.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="booking-main-grid grid-2">
        {/* Left Side: Seat Layout */}
        <div className="seat-layout-section glass-panel">
          <div className="screen-indicator">
            <div className="screen-arc"></div>
            <span>SCREEN THIS WAY</span>
          </div>

          <div className="seat-grid">
            {rows.map((row) => (
              <div key={row} className="seat-row flex-center">
                <span className="row-letter">{row}</span>
                <div className="seats-container flex">
                  {Array.from({ length: seatsPerRow }, (_, index) => {
                    const seatNum = index + 1;
                    const seatName = `${row}${seatNum}`;
                    const isReserved = reservedSeats.includes(seatName);
                    const isBooked   = bookedSeats.includes(seatName);   // Day 06: BOOKED state
                    const isSelected = selectedSeats.includes(seatName);
                    const isLockedByOther = lockedByOthers.includes(seatName);
                    const seatCategory = getSeatCategory(seatName);
                    const ttl = seatTTLs[seatName];

                    return (
                      <button
                        key={seatName}
                        onClick={() => handleSeatClick(seatName)}
                        className={`seat-btn
                          ${isReserved ? 'reserved' : ''}
                          ${isBooked   ? 'booked'   : ''}
                          ${isSelected ? 'selected' : ''}
                          ${isLockedByOther ? 'locked' : ''}
                          ${!isReserved && !isBooked && !isSelected && !isLockedByOther ? seatCategory.toLowerCase() : ''}
                        `}
                        title={
                          isBooked
                            ? `Seat ${seatName} — Already Booked (CONFIRMED)`
                            : isLockedByOther
                            ? `Seat ${seatName} — Locked by another user`
                            : `${seatName} — ${seatCategory} (₹${getSeatPrice(seatName)})`
                        }
                        aria-label={`Seat ${seatName}`}
                        type="button"
                        disabled={isLockedByOther || isBooked}
                      >
                        {isLockedByOther ? <Lock size={10} /> : seatNum}
                        {isSelected && ttl && (
                          <span className="seat-ttl-chip">{formatTTL(ttl)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <span className="row-letter">{row}</span>
              </div>
            ))}
          </div>

          {/* Seat Legend */}
          <div className="seat-legend flex-center">
            <div className="legend-item flex-center">
              <span className="legend-box available"></span>
              <span>Available</span>
            </div>
            <div className="legend-item flex-center">
              <span className="legend-box selected"></span>
              <span>Selected (Locked by you)</span>
            </div>
            <div className="legend-item flex-center">
              <span className="legend-box locked-legend"></span>
              <span>Locked (TTL)</span>
            </div>
            <div className="legend-item flex-center">
              <span className="legend-box booked-legend"></span>
              <span>Booked (Confirmed)</span>
            </div>
            <div className="legend-item flex-center">
              <span className="legend-box reserved"></span>
              <span>Reserved</span>
            </div>
          </div>

          <div className="pricing-info-legend flex-center">
            <span className="price-legend-pill standard">Row A-C: Standard (₹250)</span>
            <span className="price-legend-pill deluxe">Row D-F: Deluxe (₹350)</span>
            <span className="price-legend-pill vip">Row G-H: VIP (₹500)</span>
          </div>
        </div>

        {/* Right Side: Show & Booking Details */}
        <div className="booking-details-section flex">
          <div className="selected-movie-info glass-panel flex">
            <div className="mini-poster">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://placehold.co/80x120/1a0a2e/c8a45a?text=${encodeURIComponent(movie.title)}`;
                }}
              />
            </div>
            <div className="mini-details">
              <h3>{movie.title}</h3>
              <p className="runtime flex-center"><Clock size={12} /> {movie.runtime}</p>
              <p className="genres-list">{movie.genres.join(' • ')}</p>
            </div>
          </div>

          {/* Date Selector */}
          <div className="selection-group glass-panel">
            <label className="section-label flex-center"><Calendar size={16} /> Select Date</label>
            <div className="selection-pills flex">
              {dates.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`pill-btn ${selectedDate === d ? 'active' : ''}`}
                  type="button"
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selector — Day 06: driven by show schedule */}
          <div className="selection-group glass-panel">
            <label className="section-label flex-center"><Clock size={16} /> Select Showtime</label>
            <div className="selection-pills flex">
              {availableTimes.map((t) => (
                <button
                  key={t}
                  onClick={() => t !== 'No shows scheduled' && setSelectedTime(t)}
                  className={`pill-btn ${selectedTime === t ? 'active' : ''} ${
                    t === 'No shows scheduled' ? 'disabled-pill' : ''
                  }`}
                  type="button"
                  disabled={t === 'No shows scheduled'}
                >
                  {t}
                </button>
              ))}
            </div>
            {selectedScreen && (
              <p className="screen-info-hint flex-center">
                <Film size={12} /> {selectedScreen.name} &nbsp;•&nbsp; Capacity: {selectedScreen.capacity} seats
              </p>
            )}
          </div>

          {/* Seat Lock Info */}
          {selectedSeats.length > 0 && (
            <div className="lock-info-box glass-panel">
              <div className="lock-info-header flex-center">
                <Lock size={14} />
                <span>Seat Locks Active (Redis TTL)</span>
              </div>
              <div className="lock-seats-list">
                {selectedSeats.map((seat) => (
                  <div key={seat} className="lock-seat-row flex">
                    <span className="lock-seat-name">{seat}</span>
                    <span className="lock-seat-key">seat:{getShowKey()}:{seat}</span>
                    {seatTTLs[seat] ? (
                      <span className={`ttl-badge ${seatTTLs[seat] < 60 ? 'ttl-urgent' : ''}`}>
                        ⏱ {formatTTL(seatTTLs[seat])}
                      </span>
                    ) : (
                      <span className="ttl-badge">loading…</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="lock-info-hint">
                Seats are temporarily locked for 5 minutes. Others cannot book these seats during this window.
              </p>
            </div>
          )}

          {/* Booking Summary */}
          <div className="booking-summary-box glass-panel flex">
            <h3>Booking Summary</h3>
            <div className="summary-rows">
              <div className="summary-row flex">
                <span>Selected Seats:</span>
                <span className="val">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </span>
              </div>
              <div className="summary-row flex">
                <span>Show Date & Time:</span>
                <span className="val">
                  {selectedSeats.length > 0 ? `${selectedDate} @ ${selectedTime}` : '-'}
                </span>
              </div>
              <div className="summary-row flex total-row">
                <span>Total Amount:</span>
                <span className="val total">₹{calculateTotalPrice().toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmBooking}
              className="btn-primary confirm-btn flex-center"
              disabled={selectedSeats.length === 0 || submitting}
            >
              {submitting ? (
                <span className="spinner-small"></span>
              ) : (
                <>
                  <CreditCard size={18} /> Confirm Seat Bookings
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Redis Insights Panel ── */}
      <div className="redis-panel-wrapper">
        <button
          className="redis-panel-toggle flex-center"
          onClick={() => setShowRedisPanel((p) => !p)}
          type="button"
        >
          <Server size={15} />
          <span>Redis Insights Panel</span>
          <span className="redis-key-count">{redisEntries.length} active keys</span>
          {showRedisPanel ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showRedisPanel && (
          <div className="redis-panel">
            <div className="redis-panel-header">
              <span className="redis-dot"></span>
              <span className="redis-title">Redis Store — Live Snapshot</span>
              <button
                className="redis-refresh-btn"
                onClick={syncRedisState}
                type="button"
                title="Refresh"
              >
                <RefreshCw size={12} />
              </button>
            </div>

            <div className="redis-panel-body">
              {redisEntries.length === 0 ? (
                <div className="redis-empty">
                  <span>No active Redis keys. Select a seat or load movies to see keys appear here.</span>
                </div>
              ) : (
                <table className="redis-table">
                  <thead>
                    <tr>
                      <th>KEY</th>
                      <th>TYPE</th>
                      <th>VALUE PREVIEW</th>
                      <th>TTL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redisEntries.map((entry) => {
                      const isSeatKey = entry.key.startsWith('seat:');
                      const isMovieKey = entry.key.startsWith('movies:');
                      return (
                        <tr key={entry.key} className={isSeatKey ? 'row-seat' : 'row-movie'}>
                          <td className="redis-key">{entry.key}</td>
                          <td>
                            <span className={`redis-type-badge ${isSeatKey ? 'type-lock' : 'type-cache'}`}>
                              {isSeatKey ? '🔒 LOCK' : '💾 CACHE'}
                            </span>
                          </td>
                          <td className="redis-value">
                            {isSeatKey
                              ? `{ lockedBy: "${entry.value?.lockedBy}", seat: "${entry.value?.seatNumber}" }`
                              : isMovieKey
                              ? `Array[${Array.isArray(entry.value) ? entry.value.length : '?'}] movies`
                              : JSON.stringify(entry.value).slice(0, 40) + '…'}
                          </td>
                          <td>
                            <span className={`ttl-badge ${entry.ttlRemaining < 60 ? 'ttl-urgent' : ''}`}>
                              {formatTTL(entry.ttlRemaining)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="redis-panel-footer">
              <div className="redis-concept-pills">
                <span className="concept-pill">📌 Cache-Aside Strategy</span>
                <span className="concept-pill">⏱ TTL Enforcement</span>
                <span className="concept-pill">🔒 SET NX (Atomic Lock)</span>
                <span className="concept-pill">🚫 Race Condition Prevention</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;
