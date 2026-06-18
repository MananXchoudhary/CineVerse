export const GENRES = [
  "All",
  "Action",
  "Adventure",
  "Sci-Fi",
  "Drama",
  "Thriller",
  "Fantasy",
  "Comedy",
  "Horror",
  "Mystery",
  "War",
  "Biography"
];

export const MOCK_MOVIES = [
  // ─── HOLLYWOOD ──────────────────────────────────────────────────────────────
  {
    id: "1",
    title: "Avengers: Doomsday",
    category: "Hollywood",
    isRecent: true,
    tagline: "A new reign of doom begins in the Multiverse.",
    overview: "The Avengers assemble once again to face their greatest threat yet—Doctor Victor von Doom, who threatens to rewrite the fabric of reality itself across the Multiverse.",
    rating: 9.0,
    votes: 5120,
    releaseDate: "2026-05-01",
    runtime: "2h 45m",
    genres: ["Action", "Sci-Fi", "Adventure"],
    director: "Anthony Russo, Joe Russo",
    cast: [
      { name: "Robert Downey Jr.", character: "Doctor Doom", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Pedro Pascal", character: "Reed Richards", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/8HkIe2i4ScpCkcX9SzZ9IPasqWV.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "2",
    title: "Superman",
    category: "Hollywood",
    isRecent: true,
    tagline: "A new Man of Steel rises for a new world.",
    overview: "James Gunn reimagines Superman as a young journalist who balances his Kryptonian heritage with his human upbringing, battling the megalomaniacal Lex Luthor.",
    rating: 8.6,
    votes: 4230,
    releaseDate: "2026-07-11",
    runtime: "2h 10m",
    genres: ["Action", "Sci-Fi", "Adventure"],
    director: "James Gunn",
    cast: [
      { name: "David Corenswet", character: "Clark Kent / Superman", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Rachel Brosnahan", character: "Lois Lane", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/jE6pDqjEtBmF2KPKPW8jvJQO1BE.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "3",
    title: "Mission: Impossible — The Final Reckoning",
    category: "Hollywood",
    isRecent: true,
    tagline: "The last mission. The highest stakes.",
    overview: "Ethan Hunt and the IMF go on their most harrowing mission yet, in a race against time to stop the Entity—a rogue AI that has control over global intelligence networks.",
    rating: 9.1,
    votes: 6110,
    releaseDate: "2025-05-23",
    runtime: "2h 49m",
    genres: ["Action", "Thriller", "Adventure"],
    director: "Christopher McQuarrie",
    cast: [
      { name: "Tom Cruise", character: "Ethan Hunt", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Hayley Atwell", character: "Grace", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/z53D372UDhh8MaqYjcLZij4ESNB.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "4",
    title: "Michael",
    category: "Hollywood",
    isRecent: true,
    tagline: "The man. The music. The legacy.",
    overview: "A definitive portrait of the King of Pop, Michael Jackson, detailing his brilliant rise, complex personal life, and enduring musical genius.",
    rating: 8.7,
    votes: 3980,
    releaseDate: "2026-04-17",
    runtime: "2h 35m",
    genres: ["Drama", "Biography"],
    director: "Antoine Fuqua",
    cast: [
      { name: "Jaafar Jackson", character: "Michael Jackson", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Colman Domingo", character: "Joe Jackson", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/zm0KAbOjlt9eR5y7vDiL2dEOwMl.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "5",
    title: "Dune: Part Three",
    category: "Hollywood",
    isRecent: true,
    tagline: "The final battle for Arrakis.",
    overview: "Paul Atreides faces the ultimate test of his leadership as the universe descends into holy war, forcing him to make the ultimate sacrifice to secure the future of humanity.",
    rating: 8.9,
    votes: 4780,
    releaseDate: "2026-12-18",
    runtime: "2h 50m",
    genres: ["Sci-Fi", "Adventure", "Action"],
    director: "Denis Villeneuve",
    cast: [
      { name: "Timothée Chalamet", character: "Paul Atreides", imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Zendaya", character: "Chani", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/b4wekkUaxExzOeGe7hKXzhnyXHt.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&h=675&q=80"
  },

  // ─── BOLLYWOOD ───────────────────────────────────────────────────────────────
  {
    id: "6",
    title: "Ramayana: Part 1",
    category: "Bollywood",
    isRecent: true,
    tagline: "The timeless epic comes to life.",
    overview: "Nitesh Tiwari's mythological magnum opus chronicling the divine journey of Lord Rama, his exile, and his quest to defeat the demon king Ravana.",
    rating: 8.8,
    votes: 4500,
    releaseDate: "2026-10-23",
    runtime: "3h 05m",
    genres: ["Fantasy", "Drama", "Action"],
    director: "Nitesh Tiwari",
    cast: [
      { name: "Ranbir Kapoor", character: "Lord Rama", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Sai Pallavi", character: "Goddess Sita", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/xN7ewCzhnFiED8JlIpOEmI8xqlJ.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "7",
    title: "War 2",
    category: "Bollywood",
    isRecent: true,
    tagline: "Two legends. One mission. No limits.",
    overview: "Kabir returns from War 1 alongside a fierce new rival agent in the YRF spy universe, as they uncover a global conspiracy threatening India's sovereignty.",
    rating: 8.5,
    votes: 3750,
    releaseDate: "2026-01-25",
    runtime: "2h 35m",
    genres: ["Action", "Thriller"],
    director: "Ayan Mukerji",
    cast: [
      { name: "Hrithik Roshan", character: "Kabir", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Jr. NTR", character: "Agent X", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/tEPFUoTSMlq2Ck5MU4hWAWiCfPO.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "8",
    title: "Chhaava",
    category: "Bollywood",
    isRecent: true,
    tagline: "The warrior son of Shivaji Maharaj.",
    overview: "An epic biographical war drama depicting the life of Chhatrapati Sambhaji Maharaj, the fearless son of Chhatrapati Shivaji, and his valiant stand against the Mughal Empire.",
    rating: 8.9,
    votes: 5200,
    releaseDate: "2025-02-14",
    runtime: "2h 41m",
    genres: ["Action", "War", "Biography", "Drama"],
    director: "Laxman Utekar",
    cast: [
      { name: "Vicky Kaushal", character: "Sambhaji Maharaj", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Rashmika Mandanna", character: "Yesubai", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/ggBfyS0NOs1BHTQRcAz5G2jSFBw.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "9",
    title: "Border 2",
    category: "Bollywood",
    isRecent: true,
    tagline: "India's bravest soldiers return to defend the nation.",
    overview: "An epic war drama following a new generation of Indian soldiers during a high-stakes border conflict, highlighting their courage, sacrifice, and patriotism.",
    rating: 8.2,
    votes: 3420,
    releaseDate: "2026-01-23",
    runtime: "2h 50m",
    genres: ["Action", "War", "Drama"],
    director: "Anurag Singh",
    cast: [
      { name: "Sunny Deol", character: "Major Kuldip Singh", imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Varun Dhawan", character: "Captain Vikram", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/wUcttG71zo9deP4m9sDhYPUcvi5.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "10",
    title: "Alpha",
    category: "Bollywood",
    isRecent: true,
    tagline: "The YRF Spy Universe's first female-led mission.",
    overview: "Alia Bhatt and Sharvari star as elite agents on a high-stakes covert mission across Europe to dismantle a rogue syndicate planning a global cyber-attack.",
    rating: 8.4,
    votes: 2850,
    releaseDate: "2026-12-25",
    runtime: "2h 20m",
    genres: ["Action", "Thriller"],
    director: "Shiv Rawail",
    cast: [
      { name: "Alia Bhatt", character: "Agent Alpha / Zoya", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Sharvari Wagh", character: "Agent Beta / Riya", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/jlwWG63Yud6q5Ofv4YWaLjzZoFH.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&h=675&q=80"
  },

  // ─── SOUTH INDIAN ─────────────────────────────────────────────────────────────
  {
    id: "11",
    title: "The Raja Saab",
    category: "South Indian",
    isRecent: true,
    tagline: "Prabhas rules the haunted palace.",
    overview: "A hilarious and spooky horror-comedy set in an ancient royal palace, where a young man uncovers his ancestral connection to a quirky, powerful spirit.",
    rating: 8.1,
    votes: 3120,
    releaseDate: "2026-04-10",
    runtime: "2h 40m",
    genres: ["Comedy", "Horror", "Fantasy"],
    director: "Maruthi",
    cast: [
      { name: "Prabhas", character: "Raja Saab / Ancestral Spirit", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Malavika Mohanan", character: "Priya", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/omQhvEuFKkgWaKAag2kYPHb22La.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "12",
    title: "Toxic",
    category: "South Indian",
    isRecent: true,
    tagline: "A fairy tale for grown-ups.",
    overview: "Yash stars as a ruthless international drug lord in a high-octane action-thriller set in the dark underbelly of the global smuggling cartel.",
    rating: 8.5,
    votes: 2980,
    releaseDate: "2026-04-10",
    runtime: "2h 55m",
    genres: ["Action", "Thriller", "Drama"],
    director: "Geetu Mohandas",
    cast: [
      { name: "Yash", character: "Rocky / The Smokey King", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Nayanthara", character: "Major Anita", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/fJBAfLiNfovSAb6KjkIndpF3Sm7.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "13",
    title: "Coolie",
    category: "South Indian",
    isRecent: true,
    tagline: "He carries the weight of the world — and your enemies.",
    overview: "Superstar Rajinikanth plays a fearless railway coolie with a mysterious past who becomes the unlikely champion against a powerful criminal syndicate controlling the city.",
    rating: 8.3,
    votes: 4100,
    releaseDate: "2025-05-01",
    runtime: "2h 45m",
    genres: ["Action", "Thriller", "Drama"],
    director: "Lokesh Kanagaraj",
    cast: [
      { name: "Rajinikanth", character: "Durai / Coolie", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Nagarjuna", character: "Antagonist", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/5WBxWowQeAc6NCMF0tNvXZLEQin.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "14",
    title: "Retro",
    category: "South Indian",
    isRecent: true,
    tagline: "The past never stays buried.",
    overview: "Suriya plays a 1980s underworld don whose past resurfaces when his son unknowingly gets entangled with his old enemies — leading to an explosive confrontation.",
    rating: 8.6,
    votes: 3550,
    releaseDate: "2025-08-15",
    runtime: "2h 50m",
    genres: ["Action", "Drama", "Thriller"],
    director: "Karthik Subbaraj",
    cast: [
      { name: "Suriya", character: "Retro / Vijayakumar", imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Pooja Hegde", character: "Meera", imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/c2ynM3oORjDlbFqKHj35YOQvL6C.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&h=675&q=80"
  },
  {
    id: "15",
    title: "Avatar: Fire and Ash",
    category: "Hollywood",
    isRecent: true,
    tagline: "Return to Pandora, where a new threat burns.",
    overview: "In the third installment of James Cameron's epic franchise, Jake Sully and Neytiri encounter a new, aggressive clan of Na'vi known as the 'Ash People', who worship fire and chaos.",
    rating: 9.2,
    votes: 7500,
    releaseDate: "2025-12-19",
    runtime: "3h 10m",
    genres: ["Sci-Fi", "Adventure", "Action", "Fantasy"],
    director: "James Cameron",
    cast: [
      { name: "Sam Worthington", character: "Jake Sully", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" },
      { name: "Zoe Saldana", character: "Neytiri", imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" }
    ],
    posterUrl: "https://image.tmdb.org/t/p/w500/8tCn6Zl5B4N0Uo2W3X1hW98Q0qY.jpg",
    backdropUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&h=675&q=80"
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Day 06: Theatre & Screen Data Models
// ─────────────────────────────────────────────────────────────────────────────
// Academic Insight:
//   Theatre → 1-to-Many → Screens → 1-to-Many → Shows
//   Each Screen has a capacity and a seat layout (configurable).
//   One theatre can have multiple screens; each screen runs independent shows.
//
// Spring Boot equivalent:
//   @Entity class Theatre { @OneToMany List<Screen> screens; }
//   @Entity class Screen  { @ManyToOne Theatre theatre; int capacity; }
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_THEATRES = [
  {
    theatreId: 'TH-001',
    name: 'PVR Cinemas — Phoenix Mall',
    location: 'Phoenix MarketCity, Kurla, Mumbai',
    city: 'Mumbai',
    screens: [
      { screenId: 'SC-001-1', name: 'Screen 1 — Gold Lounge',       capacity: 80,  type: 'PREMIUM' },
      { screenId: 'SC-001-2', name: 'Screen 2 — Standard',          capacity: 120, type: 'STANDARD' },
      { screenId: 'SC-001-3', name: 'Screen 3 — IMAX 3D',           capacity: 150, type: 'IMAX' },
      { screenId: 'SC-001-4', name: 'Screen 4 — Premium Dolby',     capacity: 100, type: 'DOLBY' },
    ],
  },
  {
    theatreId: 'TH-002',
    name: 'INOX — R City Mall',
    location: 'R City Mall, Ghatkopar, Mumbai',
    city: 'Mumbai',
    screens: [
      { screenId: 'SC-002-1', name: 'Screen 1 — Standard',          capacity: 110, type: 'STANDARD' },
      { screenId: 'SC-002-2', name: 'Screen 2 — Director\'s Cut',   capacity: 60,  type: 'PREMIUM' },
      { screenId: 'SC-002-3', name: 'Screen 3 — 4DX Experience',    capacity: 90,  type: '4DX' },
    ],
  },
  {
    theatreId: 'TH-003',
    name: 'Cinepolis — Oberoi Mall',
    location: 'Oberoi Mall, Goregaon East, Mumbai',
    city: 'Mumbai',
    screens: [
      { screenId: 'SC-003-1', name: 'Screen 1 — Sapphire',          capacity: 95,  type: 'PREMIUM' },
      { screenId: 'SC-003-2', name: 'Screen 2 — Standard',          capacity: 130, type: 'STANDARD' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Day 06: Show Scheduling Data Model
// ─────────────────────────────────────────────────────────────────────────────
// A Show represents a Movie scheduled on a specific Screen at a specific time.
// Design Constraint from slides:
//   - No overlapping shows on same screen
//   - Show slots must be validated (runtime + buffer)
//
// Spring Boot equivalent:
//   @Entity class Show {
//     @ManyToOne Movie movie;
//     @ManyToOne Screen screen;
//     LocalDateTime startTime;
//   }
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_SHOWS = [
  // PVR Phoenix — Screen 1 (Gold Lounge)
  { showId: 'SH-001', movieId: '1',  theatreId: 'TH-001', screenId: 'SC-001-1', date: 'Today, June 10',     startTime: '12:30 PM' },
  { showId: 'SH-002', movieId: '1',  theatreId: 'TH-001', screenId: 'SC-001-1', date: 'Today, June 10',     startTime: '07:00 PM' },
  { showId: 'SH-003', movieId: '2',  theatreId: 'TH-001', screenId: 'SC-001-1', date: 'Tomorrow, June 11',  startTime: '03:45 PM' },
  { showId: 'SH-004', movieId: '3',  theatreId: 'TH-001', screenId: 'SC-001-1', date: 'Tomorrow, June 11',  startTime: '09:45 PM' },

  // PVR Phoenix — Screen 3 (IMAX 3D)
  { showId: 'SH-005', movieId: '5',  theatreId: 'TH-001', screenId: 'SC-001-3', date: 'Today, June 10',     startTime: '11:00 AM' },
  { showId: 'SH-006', movieId: '5',  theatreId: 'TH-001', screenId: 'SC-001-3', date: 'Today, June 10',     startTime: '03:00 PM' },
  { showId: 'SH-007', movieId: '15', theatreId: 'TH-001', screenId: 'SC-001-3', date: 'Tomorrow, June 11',  startTime: '07:30 PM' },
  { showId: 'SH-008', movieId: '15', theatreId: 'TH-001', screenId: 'SC-001-3', date: 'Tomorrow, June 11',  startTime: '11:00 PM' },

  // PVR Phoenix — Screen 4 (Dolby)
  { showId: 'SH-009', movieId: '8',  theatreId: 'TH-001', screenId: 'SC-001-4', date: 'Today, June 10',     startTime: '02:15 PM' },
  { showId: 'SH-010', movieId: '13', theatreId: 'TH-001', screenId: 'SC-001-4', date: 'Wednesday, June 12', startTime: '08:00 PM' },

  // INOX R City — Screen 1 (Standard)
  { showId: 'SH-011', movieId: '1',  theatreId: 'TH-002', screenId: 'SC-002-1', date: 'Today, June 10',     startTime: '01:00 PM' },
  { showId: 'SH-012', movieId: '1',  theatreId: 'TH-002', screenId: 'SC-002-1', date: 'Today, June 10',     startTime: '04:30 PM' },
  { showId: 'SH-013', movieId: '6',  theatreId: 'TH-002', screenId: 'SC-002-1', date: 'Tomorrow, June 11',  startTime: '09:30 PM' },
  { showId: 'SH-014', movieId: '7',  theatreId: 'TH-002', screenId: 'SC-002-1', date: 'Wednesday, June 12', startTime: '12:30 PM' },

  // INOX R City — Screen 3 (4DX)
  { showId: 'SH-015', movieId: '3',  theatreId: 'TH-002', screenId: 'SC-002-3', date: 'Today, June 10',     startTime: '06:00 PM' },
  { showId: 'SH-016', movieId: '4',  theatreId: 'TH-002', screenId: 'SC-002-3', date: 'Tomorrow, June 11',  startTime: '05:00 PM' },

  // Cinepolis Oberoi — Screen 1 (Sapphire)
  { showId: 'SH-017', movieId: '1',  theatreId: 'TH-003', screenId: 'SC-003-1', date: 'Today, June 10',     startTime: '12:00 PM' },
  { showId: 'SH-018', movieId: '10', theatreId: 'TH-003', screenId: 'SC-003-1', date: 'Tomorrow, June 11',  startTime: '08:00 PM' },
  { showId: 'SH-019', movieId: '11', theatreId: 'TH-003', screenId: 'SC-003-1', date: 'Wednesday, June 12', startTime: '03:30 PM' },

  // Cinepolis Oberoi — Screen 2 (Standard)
  { showId: 'SH-020', movieId: '12', theatreId: 'TH-003', screenId: 'SC-003-2', date: 'Today, June 10',     startTime: '09:45 PM' },
  { showId: 'SH-021', movieId: '14', theatreId: 'TH-003', screenId: 'SC-003-2', date: 'Tomorrow, June 11',  startTime: '01:15 PM' },
  { showId: 'SH-022', movieId: '9',  theatreId: 'TH-003', screenId: 'SC-003-2', date: 'Wednesday, June 12', startTime: '07:00 PM' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Day 06: Booking Status FSM (Finite State Machine)
// ─────────────────────────────────────────────────────────────────────────────
// State transitions from lecture slides:
//   INITIATED → seat selected, booking request made
//   LOCKED    → seat lock acquired in Redis (TTL active)
//   CONFIRMED → payment processed, booking persisted
//   CANCELLED → user cancelled or timeout before payment
//   EXPIRED   → lock TTL expired before confirmation
// ─────────────────────────────────────────────────────────────────────────────
export const BOOKING_STATUS = {
  INITIATED: 'INITIATED',
  LOCKED:    'LOCKED',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED:   'EXPIRED',
};


// -----------------------------------------------------------------------------
// Day 05: Reviews & Ratings Data Model
// MongoDB Document Schema: { movieId, userId, rating, review }
// Spring Boot: POST /api/reviews, GET /api/reviews/{movieId}
// -----------------------------------------------------------------------------
export const MOCK_REVIEWS = [
  { reviewId: 'R-001', movieId: '1',  userId: 'user_aarav', username: 'Aarav S.',  rating: 5, text: 'Absolutely mind-blowing! RDJ as Doctor Doom is perfection. The multiverse storyline kept me on edge.', date: '2026-05-05' },
  { reviewId: 'R-002', movieId: '1',  userId: 'user_priya', username: 'Priya P.',  rating: 4, text: 'Epic scale and incredible VFX. Pacing slightly off in act 2 but the finale was worth every minute.', date: '2026-05-06' },
  { reviewId: 'R-003', movieId: '1',  userId: 'user_sneha', username: 'Sneha R.',  rating: 5, text: 'Best MCU film since Endgame! The Russo brothers have outdone themselves.', date: '2026-05-07' },
  { reviewId: 'R-004', movieId: '2',  userId: 'user_rahul', username: 'Rahul M.',  rating: 4, text: 'James Gunn delivers a fresh heartfelt Superman. David Corenswet is the perfect Clark Kent.', date: '2026-07-15' },
  { reviewId: 'R-005', movieId: '2',  userId: 'user_divya', username: 'Divya K.',  rating: 5, text: 'Made me believe a man can fly again. Emotional fun and visually stunning.', date: '2026-07-16' },
  { reviewId: 'R-006', movieId: '3',  userId: 'user_aarav', username: 'Aarav S.',  rating: 5, text: 'Tom Cruise is an absolute legend. The biplane sequence left me speechless.', date: '2025-05-25' },
  { reviewId: 'R-007', movieId: '3',  userId: 'user_rajan', username: 'Rajan T.',  rating: 5, text: 'Non-stop thrills with genuine emotional stakes. McQuarrie at his best.', date: '2025-05-26' },
  { reviewId: 'R-008', movieId: '8',  userId: 'user_sneha', username: 'Sneha R.',  rating: 5, text: 'Vicky Kaushal delivers a career-defining performance. A tribute to Sambhaji Maharaj.', date: '2025-02-15' },
  { reviewId: 'R-009', movieId: '8',  userId: 'user_priya', username: 'Priya P.',  rating: 5, text: 'Every frame is cinematic gold. The battle sequences rival Hollywood productions.', date: '2025-02-17' },
  { reviewId: 'R-010', movieId: '8',  userId: 'user_divya', username: 'Divya K.',  rating: 4, text: 'Emotionally devastating and historically rich. A must-watch for every Indian.', date: '2025-02-18' },
  { reviewId: 'R-011', movieId: '15', userId: 'user_rajan', username: 'Rajan T.',  rating: 5, text: 'James Cameron creates another visual masterpiece. Pandora is beyond imagination.', date: '2025-12-22' },
  { reviewId: 'R-012', movieId: '15', userId: 'user_aarav', username: 'Aarav S.',  rating: 4, text: 'Stunning visuals though the 3-hour runtime tests patience. Worth every minute in IMAX.', date: '2025-12-23' },
  { reviewId: 'R-013', movieId: '6',  userId: 'user_priya', username: 'Priya P.',  rating: 5, text: 'Ranbir Kapoor is divine as Lord Rama. The grandeur music emotion all perfect.', date: '2026-10-25' },
  { reviewId: 'R-014', movieId: '6',  userId: 'user_sneha', username: 'Sneha R.',  rating: 4, text: 'A reverent and spectacular retelling. Part 2 cannot come soon enough.', date: '2026-10-26' },
  { reviewId: 'R-015', movieId: '13', userId: 'user_rahul', username: 'Rahul M.',  rating: 4, text: 'Rajinikanth still has it! The energy style all intact. Lokesh Kanagaraj delivers again.', date: '2025-05-03' },
];
