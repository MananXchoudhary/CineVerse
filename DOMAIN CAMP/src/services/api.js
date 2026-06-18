import axios from 'axios';
import { MOCK_MOVIES, MOCK_THEATRES, MOCK_SHOWS, BOOKING_STATUS, MOCK_REVIEWS } from './mockData';
import { redisGet, redisSet } from './redisCache';

// ──────────────────────────────────────────────────────────
// Redis Cache Keys (Day 7)
// ──────────────────────────────────────────────────────────
const CACHE_KEY_MOVIES = 'movies:all';
const CACHE_TTL_MOVIES  = 300; // 5 minutes

// Create an Axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// VERSION: bump this whenever mockData.js changes to force a cache refresh
const DATA_VERSION = 'v6-removed-sikandar-2026';
const MOVIES_KEY = 'cineverse_movies_in_2026';
const VERSION_KEY = 'cineverse_data_version';

// Helper to load movies from localStorage or default mock data
const getPersistedMovies = () => {
  const storedVersion = localStorage.getItem(VERSION_KEY);
  if (storedVersion !== DATA_VERSION) {
    // Data version mismatch — wipe old cache and reload fresh from mockData.js
    localStorage.removeItem(MOVIES_KEY);
    localStorage.setItem(VERSION_KEY, DATA_VERSION);
    localStorage.setItem(MOVIES_KEY, JSON.stringify(MOCK_MOVIES));
    return MOCK_MOVIES;
  }
  const stored = localStorage.getItem(MOVIES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error parsing stored movies, resetting to default mock', e);
    }
  }
  localStorage.setItem(MOVIES_KEY, JSON.stringify(MOCK_MOVIES));
  return MOCK_MOVIES;
};

// Helper to load bookings from localStorage
const getPersistedBookings = () => {
  const stored = localStorage.getItem('cineverse_bookings_in_2026');
  return stored ? JSON.parse(stored) : [];
};

// Helper to load reviews from localStorage
const getPersistedReviews = () => {
  const stored = localStorage.getItem('cineverse_reviews_in_2026');
  if (stored) {
    try { return JSON.parse(stored); } catch { return MOCK_REVIEWS; }
  }
  localStorage.setItem('cineverse_reviews_in_2026', JSON.stringify(MOCK_REVIEWS));
  return MOCK_REVIEWS;
};

// ─────────────────────────────────────────────────────────────────────────────
// Day 05: Standardized API Response Format (from slides)
// All responses follow: { status, message, data }
// Spring Boot: return ResponseEntity.ok(new ApiResponse("success", "...", data));
// ─────────────────────────────────────────────────────────────────────────────
const apiResponse = (status, message, data) => ({ status, message, data });

// ──────────────────────────────────────────────────────────
// Day 08: RabbitMQ & Event-Driven Architecture (Simulation)
// ──────────────────────────────────────────────────────────
class MockRabbitMQ {
  constructor() {
    this.bookingQueue = [];
    this.deadLetterQueue = [];
  }

  // Producer
  publish(queueName, message) {
    console.log(`[RabbitMQ Producer] Published event to ${queueName}:`, message.id);
    if (queueName === 'bookingQueue') {
      this.bookingQueue.push({ ...message, retryCount: 0 });
      this.triggerConsumer();
    }
  }

  // Consumer
  triggerConsumer() {
    // Non-blocking async processing
    setTimeout(() => {
      while (this.bookingQueue.length > 0) {
        const event = this.bookingQueue.shift();
        this.processBookingEvent(event);
      }
    }, 1500);
  }

  processBookingEvent(event) {
    console.log(`[Notification Consumer] Consuming event for booking: ${event.id}`);
    
    // Simulate a random processing failure to demonstrate retry & DLQ (30% chance of fail)
    const processingFailed = Math.random() < 0.3;

    if (processingFailed) {
      event.retryCount += 1;
      console.warn(`[Notification Consumer] Processing failed for ${event.id} (Attempt ${event.retryCount}/3)`);
      
      if (event.retryCount >= 3) {
        console.error(`[RabbitMQ] Max retries reached for ${event.id}. Moving to Dead Letter Queue (DLQ).`);
        this.deadLetterQueue.push(event);
      } else {
        // Re-queue with slight delay
        setTimeout(() => {
          this.bookingQueue.push(event);
          this.triggerConsumer();
        }, 1000);
      }
    } else {
      console.log(`[Notification Consumer] Success! Sent ticket confirmation email for ${event.id}.`);
    }
  }
}

export const rabbitMQ = new MockRabbitMQ();

// Request interceptor to attach JWT token conceptually
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified request mocker to handle SPA fallbacks and connection failures alike
const handleMockRequest = async (config) => {
  // Mock API delay for realism
  await new Promise((resolve) => setTimeout(resolve, 300));

  const url = config.url || '';
  const method = config.method ? config.method.toLowerCase() : 'get';
  const data = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : null;

  // ─────────────────────────────────────────────────────────────────────────────
  // Day 04: API Gateway — Global Pre-Filter (Logging)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log(`[API Gateway] Intercepted ${method.toUpperCase()} request to: ${url}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // Day 04: Centralized Authentication & JWT Validation at Gateway
  // ─────────────────────────────────────────────────────────────────────────────
  // Helper to decode conceptual JWT
  const decodeJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  };

  const authHeader = config.headers?.['Authorization'] || '';
  const token = authHeader.replace('Bearer ', '');
  const decodedToken = token ? decodeJWT(token) : null;

  // Protect sensitive routes at the Gateway level
  const protectedRoutes = [
    { pattern: '/bookings', methods: ['post', 'get'] },
    { pattern: '/movies', methods: ['post', 'put', 'delete'] },
    { pattern: '/reviews', methods: ['post'] }
  ];

  const requiresAuth = protectedRoutes.some(
    route => url.includes(route.pattern) && route.methods.includes(method)
  );

  if (requiresAuth) {
    if (!decodedToken || decodedToken.exp < Date.now()) {
      console.error(`[API Gateway] Authentication Failed: Invalid or expired token for ${url}`);
      return Promise.reject({ response: { status: 401, data: apiResponse('error', 'Unauthorized: Invalid JWT token at Gateway') } });
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Day 03: Simulated User Repository (PostgreSQL DB Simulation)
  // ─────────────────────────────────────────────────────────────────────────────
  const getPersistedUsers = () => {
    const stored = localStorage.getItem('cineverse_users');
    if (stored) return JSON.parse(stored);
    
    // Seed default users for quick access
    const defaultUsers = [
      { id: 1, username: 'aarav_cinema', email: 'aarav@example.com', password: '[HASHED]password123', role: 'User' },
      { id: 2, username: 'raj_multiplex', email: 'raj@example.com', password: '[HASHED]password123', role: 'Theatre Owner' },
      { id: 3, username: 'devendra_admin', email: 'devendra@example.com', password: '[HASHED]password123', role: 'Admin' }
    ];
    localStorage.setItem('cineverse_users', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  // Route handler for Auth / Register
  if (url.includes('/auth/register') && method === 'post') {
    const { username, email, password, role } = data;
    
    // Day 03: DTO Validation
    if (!email || !email.includes('@') || password.length < 6) {
      return Promise.reject({ response: { status: 400, data: { message: 'Validation failed: Invalid email or password length', status: 400 } } });
    }

    const users = getPersistedUsers();
    if (users.find(u => u.username === username || u.email === email)) {
      return Promise.reject({ response: { status: 400, data: { message: 'User already exists', status: 400 } } });
    }

    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: `[HASHED]${password}`, // Day 03: BCrypt Simulation
      role: role || 'User'
    };
    
    localStorage.setItem('cineverse_users', JSON.stringify([...users, newUser]));
    return {
      status: 201,
      data: apiResponse('success', 'User registered successfully', { username: newUser.username })
    };
  }

  // Route handler for Auth / Forgot Password
  if (url.includes('/auth/forgot-password') && method === 'post') {
    const { email } = data;
    if (!email) return Promise.reject({ response: { status: 400, data: { message: 'Email required', status: 400 } } });
    
    // Simulate sending recovery email
    return { status: 200, data: apiResponse('success', 'If the email exists, a recovery link has been sent.') };
  }

  // Route handler for Auth / Reset Password
  if (url.includes('/auth/reset-password') && method === 'post') {
    const { token, newPassword } = data;
    if (!token || !newPassword || newPassword.length < 6) {
      return Promise.reject({ response: { status: 400, data: { message: 'Invalid token or weak password', status: 400 } } });
    }
    
    return { status: 200, data: apiResponse('success', 'Password reset successfully.') };
  }

  // Route handler for Auth / Login
  if (url.includes('/auth/login') && method === 'post') {
    const { username, password } = data;
    
    // Day 03: DTO Validation
    if (!username || !password) {
      return Promise.reject({ response: { status: 400, data: { message: 'Username and password are required', status: 400 } } });
    }

    // Day 03: Authentication & DB Lookup
    const users = getPersistedUsers();
    const user = users.find(u => u.username === username || u.email === username);
    
    // Day 03: Password verification (Simulating BCrypt match)
    if (!user || user.password !== `[HASHED]${password}`) {
      console.error(`[Auth Service] Login failed for ${username}`);
      return Promise.reject({ response: { status: 401, data: { message: 'Invalid credentials', status: 401 } } });
    }

    // Conceptual JWT Token generation: header.payload.signature
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ username: user.username, role: user.role, exp: Date.now() + 3600000 }));
    const signature = 'mock_signature_cineverse';
    const token = `${header}.${payload}.${signature}`;

    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
      data: {
        token,
        user: {
          username: user.username,
          role: user.role,
        },
      },
    };
  }

  // Route handler for Movies list
  if (url.endsWith('/movies')) {
    if (method === 'get') {
      const movies = getPersistedMovies();
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: movies,
      };
    }

    if (method === 'post') {
      // ─────────────────────────────────────────────────────────────────────────────
      // Day 04: API Gateway — Role-Based Access Control (RBAC) / Security Filter Chain
      // ─────────────────────────────────────────────────────────────────────────────
      if (decodedToken.role !== 'Admin' && decodedToken.role !== 'Theatre Owner') {
        console.error(`[API Gateway] Authorization Failed: User ${decodedToken.username} lacks required role for ${url}`);
        return Promise.reject({ response: { status: 403, data: apiResponse('error', 'Forbidden: Insufficient privileges') } });
      }

      const movies = getPersistedMovies();
      const newMovie = {
        id: String(movies.length + 1),
        rating: 8.0,
        votes: 1,
        releaseDate: new Date().toISOString().split('T')[0],
        runtime: '2h 00m',
        ...data,
      };
      const updatedMovies = [newMovie, ...movies];
      localStorage.setItem('cineverse_movies_in_2026', JSON.stringify(updatedMovies));

      return {
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
        data: newMovie,
      };
    }
  }

  // Route handler for Reviews (Day 05)
  if (url.includes('/reviews')) {
    if (method === 'get') {
      // GET /reviews/{movieId}
      const movieId = url.split('/reviews/')[1] || config.params?.movieId;
      const reviews = getPersistedReviews();
      const filtered = movieId ? reviews.filter(r => r.movieId === String(movieId)) : reviews;
      return {
        status: 200, statusText: 'OK', headers: {}, config,
        data: apiResponse('success', `Fetched ${filtered.length} review(s)`, filtered),
      };
    }
    if (method === 'post') {
      const reviews = getPersistedReviews();
      const newReview = {
        reviewId: `R-${Date.now().toString().slice(-5)}`,
        date: new Date().toISOString().split('T')[0],
        ...data,
      };
      const updated = [newReview, ...reviews];
      localStorage.setItem('cineverse_reviews_in_2026', JSON.stringify(updated));
      return {
        status: 201, statusText: 'Created', headers: {}, config,
        data: apiResponse('success', 'Review added successfully', newReview),
      };
    }
  }

  // Route handler for Movie Search (Day 05)
  if (url.includes('/movies/search') && method === 'get') {
    const q = (config.params?.q || '').toLowerCase();
    const sortBy = config.params?.sortBy || 'rating';
    const page = parseInt(config.params?.page || '1', 10);
    const pageSize = parseInt(config.params?.pageSize || '6', 10);
    let movies = getPersistedMovies();
    if (q) {
      movies = movies.filter(
        m => m.title.toLowerCase().includes(q) ||
             (m.genres || []).some(g => g.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'rating') movies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'title') movies = [...movies].sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'date') movies = [...movies].sort((a, b) => new Date(b.releaseDate || '2026') - new Date(a.releaseDate || '2026'));
    const total = movies.length;
    const paginated = movies.slice((page - 1) * pageSize, page * pageSize);
    return {
      status: 200, statusText: 'OK', headers: {}, config,
      data: apiResponse('success', `Found ${total} movie(s)`, { movies: paginated, total, page, pageSize }),
    };
  }

  // Route handler for Theatres list (Day 06)
  if (url.endsWith('/theatres') && method === 'get') {
    return {
      status: 200, statusText: 'OK', headers: {}, config,
      data: MOCK_THEATRES,
    };
  }

  // Route handler for Shows by movie (Day 06)
  if (url.includes('/shows') && method === 'get') {
    // Extract movieId from query string e.g. /shows?movieId=1
    const movieId = config.params?.movieId;
    const theatreId = config.params?.theatreId;
    let shows = MOCK_SHOWS;
    if (movieId) shows = shows.filter(s => s.movieId === String(movieId));
    if (theatreId) shows = shows.filter(s => s.theatreId === theatreId);
    return {
      status: 200, statusText: 'OK', headers: {}, config,
      data: shows,
    };
  }

  // Route handler for Bookings
  if (url.endsWith('/bookings')) {
    if (method === 'post') {
      // ─────────────────────────────────────────────────────────────────────────────
      // Day 04: Synchronous Inter-Service Communication (RestTemplate Simulation)
      // Booking Service synchronously calls Theatre/Show service to verify availability.
      // If the show doesn't exist, the entire request fails immediately.
      // ─────────────────────────────────────────────────────────────────────────────
      const requestedShowId = data.showId || data.show?.id;
      if (requestedShowId) {
        console.log(`[Booking Service] Synchronously checking Show Service for showId: ${requestedShowId}...`);
        const showExists = MOCK_SHOWS.find(s => s.id === requestedShowId);
        if (!showExists) {
          console.error(`[Booking Service] Show verification failed.`);
          return Promise.reject({ response: { status: 404, data: apiResponse('error', 'Show not found in Theatre Service') } });
        }
        console.log(`[Booking Service] Show verified successfully.`);
      }

      const bookings = getPersistedBookings();
      // Day 06: Booking Status FSM — booking starts INITIATED → becomes CONFIRMED after payment
      const newBooking = {
        id: `BK-${Date.now().toString().slice(-6)}`,
        bookingDate: new Date().toISOString(),
        ...data,
        status: BOOKING_STATUS.CONFIRMED,   // FSM: INITIATED → LOCKED → CONFIRMED
      };
      const updatedBookings = [newBooking, ...bookings];
      localStorage.setItem('cineverse_bookings_in_2026', JSON.stringify(updatedBookings));

      // ─────────────────────────────────────────────────────────────────────────────
      // Day 08: Asynchronous Inter-Service Communication (Message Broker Simulation)
      // Booking Service emits a non-blocking event to RabbitMQ.
      // ─────────────────────────────────────────────────────────────────────────────
      rabbitMQ.publish('bookingQueue', newBooking);

      return {
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
        data: newBooking,
      };
    }
    if (method === 'get') {
      const bookings = getPersistedBookings();
      return {
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        data: bookings,
      };
    }
  }

  throw new Error(`Unmapped mock endpoint: ${method.toUpperCase()} ${url}`);
};

// Response interceptor to intercept mock requests and return static mock data
// This makes the frontend fully API-ready using Axios under the hood
api.interceptors.response.use(
  async (response) => {
    const { config } = response;
    // If Vite dev server falls back to index.html for API requests (SPA routing)
    if (config && typeof response.data === 'string' && response.data.includes('<!doctype html>')) {
      return handleMockRequest(config);
    }
    return response;
  },
  async (error) => {
    const { config } = error;
    if (config) {
      try {
        return await handleMockRequest(config);
      } catch (mockError) {
        return Promise.reject(mockError);
      }
    }
    return Promise.reject(error);
  }
);

// Abstracted API methods
export const movieService = {
  getMovies: async () => {
    // ──────────────────────────────────────────────────────
    // Cache-Aside Strategy (Lazy Loading) — Day 7 Redis
    // ──────────────────────────────────────────────────────
    // Step 1: Check Redis cache
    const cached = redisGet(CACHE_KEY_MOVIES);
    if (cached.hit) {
      // ✅ CACHE HIT — return data directly from Redis
      // No DB call needed → reduced latency
      console.log('[Cache] HIT — movies:all served from Redis (no DB call)');
      return { data: cached.value, cacheHit: true };
    }

    // ❌ CACHE MISS — fetch from DB (mockData / Axios)
    console.log('[Cache] MISS — fetching movies from DB...');
    try {
      const response = await api.get('/movies');
      const movies = response.data;
      // Step 2: Store result in Redis cache (TTL = 300s)
      redisSet(CACHE_KEY_MOVIES, movies, CACHE_TTL_MOVIES);
      console.log(`[Cache] Stored movies:all in Redis (TTL: ${CACHE_TTL_MOVIES}s)`);
      return { data: movies, cacheHit: false };
    } catch (error) {
      const movies = getPersistedMovies();
      redisSet(CACHE_KEY_MOVIES, movies, CACHE_TTL_MOVIES);
      return { data: movies, cacheHit: false };
    }
  },
  addMovie: async (movieData) => {
    try {
      const response = await api.post('/movies', movieData);
      return response.data;
    } catch (error) {
      const movies = getPersistedMovies();
      const newMovie = {
        id: String(movies.length + 1),
        rating: 8.0,
        votes: 1,
        releaseDate: new Date().toISOString().split('T')[0],
        runtime: '2h 00m',
        ...movieData,
      };
      localStorage.setItem(MOVIES_KEY, JSON.stringify([newMovie, ...movies]));
      return newMovie;
    }
  },
};

export const authService = {
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Login failed');
      }
      throw error;
    }
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }
};

export const bookingService = {
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      const bookings = getPersistedBookings();
      const newBooking = {
        id: `BK-${Date.now().toString().slice(-6)}`,
        bookingDate: new Date().toISOString(),
        ...bookingData,
      };
      localStorage.setItem('cineverse_bookings_in_2026', JSON.stringify([newBooking, ...bookings]));
      return newBooking;
    }
  },
  getBookings: async () => {
    try {
      const response = await api.get('/bookings');
      return response.data;
    } catch (error) {
      return getPersistedBookings();
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Day 06: Theatre Service
// Fetches the list of theatres and their screens.
// Academic Insight: Theatre → 1-to-Many → Screens
// Spring Boot equivalent: GET /api/theatres → List<Theatre>
// ─────────────────────────────────────────────────────────────────────────────
export const theatreService = {
  getTheatres: async () => {
    try {
      const response = await api.get('/theatres');
      return response.data;
    } catch {
      return MOCK_THEATRES;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Day 06: Show Service
// Fetches shows scheduled for a specific movie (and optionally a theatre).
// Academic Insight: Show = Movie + Screen + Time slot
// Spring Boot equivalent: GET /api/shows?movieId=1&theatreId=TH-001
// ─────────────────────────────────────────────────────────────────────────────
export const showService = {
  getShowsByMovie: async (movieId, theatreId = null) => {
    try {
      const params = { movieId };
      if (theatreId) params.theatreId = theatreId;
      const response = await api.get('/shows', { params });
      return response.data;
    } catch {
      let shows = MOCK_SHOWS.filter(s => s.movieId === String(movieId));
      if (theatreId) shows = shows.filter(s => s.theatreId === theatreId);
      return shows;
    }
  },
};

export default api;

// ─────────────────────────────────────────────────────────────────────────────
// Day 05: Review Service
// Fetches and submits movie reviews.
// Academic Insight: Reviews capture user feedback and power recommendation
// systems (slides). Ratings are averaged for display.
// Spring Boot: GET /api/reviews/{movieId}, POST /api/reviews
// ─────────────────────────────────────────────────────────────────────────────
export const reviewService = {
  getReviews: async (movieId) => {
    try {
      const response = await api.get(`/reviews/${movieId}`);
      return response.data.data || response.data;
    } catch {
      return getPersistedReviews().filter(r => r.movieId === String(movieId));
    }
  },
  addReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data.data || response.data;
    } catch {
      const reviews = getPersistedReviews();
      const newReview = { reviewId: `R-${Date.now()}`, date: new Date().toISOString().split('T')[0], ...reviewData };
      localStorage.setItem('cineverse_reviews_in_2026', JSON.stringify([newReview, ...reviews]));
      return newReview;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Day 05: Movie Search Service (with pagination + sorting)
// Spring Boot: GET /api/movies/search?q=avengers&sortBy=rating&page=1
// ─────────────────────────────────────────────────────────────────────────────
export const movieSearchService = {
  search: async ({ q = '', sortBy = 'rating', page = 1, pageSize = 6 } = {}) => {
    try {
      const response = await api.get('/movies/search', { params: { q, sortBy, page, pageSize } });
      return response.data.data;
    } catch {
      let movies = getPersistedMovies();
      if (q) movies = movies.filter(
        m => m.title.toLowerCase().includes(q.toLowerCase()) ||
             (m.genres || []).some(g => g.toLowerCase().includes(q.toLowerCase()))
      );
      if (sortBy === 'rating') movies = [...movies].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      else if (sortBy === 'title') movies = [...movies].sort((a, b) => a.title.localeCompare(b.title));
      else if (sortBy === 'date') movies = [...movies].sort((a, b) => new Date(b.releaseDate || '2026') - new Date(a.releaseDate || '2026'));
      const total = movies.length;
      return { movies: movies.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize };
    }
  },
};
