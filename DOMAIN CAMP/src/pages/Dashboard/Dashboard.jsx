import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { bookingService, movieService } from '../../services/api';
import {
  User as UserIcon,
  Film,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Ticket,
  PlusCircle,
  FileText,
  MapPin,
  Clock,
  ShieldCheck
} from 'lucide-react';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admin-specific user list for RBAC user management simulation
  const [simulatedUsers, setSimulatedUsers] = useState([
    { id: 1, name: 'Aarav Sharma', email: 'aarav@gmail.com', role: 'User' },
    { id: 2, name: 'Raj Multiplex', email: 'owner@raj.com', role: 'Theatre Owner' },
    { id: 3, name: 'Priya Patel', email: 'owner@priya.com', role: 'Theatre Owner' },
    { id: 4, name: 'Devendra Admin', email: 'admin@cineverse.com', role: 'Admin' },
    { id: 5, name: 'Manan Choudhary', email: 'manan1805@gmail.com', role: 'User' },
  ]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [bookingsData, moviesResult] = await Promise.all([
          bookingService.getBookings(),
          movieService.getMovies()
        ]);
        setBookings(bookingsData);
        // moviesResult is { data: movies[], cacheHit: boolean } (Day 7 Cache-Aside)
        setMovies(moviesResult.data || moviesResult);
      } catch (e) {
        console.error('Error fetching dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    setSimulatedUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

    // If the updated user is the currently logged-in user, we can alert them
    if (simulatedUsers.find(u => u.id === userId)?.email === user.email) {
      alert(`Your role has been updated to ${newRole}. Please re-login to see the changes.`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container container">
      {/* Welcome Banner */}
      <div className="welcome-banner glass-panel flex">
        <div className="user-profile flex-center">
          <UserIcon size={32} />
        </div>
        <div className="welcome-text">
          <h2>Welcome Back, {user?.username || 'Guest'}!</h2>
          <div className="role-tags flex">
            <span className={`role-badge ${user?.role.toLowerCase().replace(' ', '-')}`}>
              <ShieldCheck size={14} />
              {user?.role}
            </span>
            <span className="session-token">JWT Authenticated</span>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary logout-btn">
          Log Out
        </button>
      </div>

      {/* -------------------- USER DASHBOARD VIEW -------------------- */}
      {user?.role === 'User' && (
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center user-icon-bg">
                <Ticket size={24} />
              </div>
              <div className="stats-info">
                <h3>{bookings.length}</h3>
                <p>Movies Booked</p>
              </div>
            </div>

            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center points-icon-bg">
                <TrendingUp size={24} />
              </div>
              <div className="stats-info">
                <h3>{bookings.length * 150}</h3>
                <p>Loyalty Reward Points</p>
              </div>
            </div>

            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center level-icon-bg">
                <ShieldCheck size={24} />
              </div>
              <div className="stats-info">
                <h3>Silver</h3>
                <p>Membership Rank</p>
              </div>
            </div>
          </div>

          <div className="main-section glass-panel">
            <div className="section-header flex">
              <h3>Your Bookings History</h3>
              <Link to="/catalog" className="btn-primary btn-sm flex-center">
                <PlusCircle size={16} /> Book New Ticket
              </Link>
            </div>

            {loading ? (
              <div className="loader-container flex-center">
                <span className="spinner-small"></span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state text-center">
                <Ticket size={48} className="empty-icon" />
                <p>No movie tickets booked yet.</p>
                <Link to="/catalog" className="btn-secondary">Explore Movie Catalog</Link>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking.id} className="booking-item flex">
                    <div className="booking-poster">
                      <img src={booking.moviePoster || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=150&h=200&q=80'} alt="" referrerPolicy="no-referrer" />
                    </div>
                    <div className="booking-details">
                      <h4>{booking.movieTitle}</h4>
                      <div className="booking-meta grid">
                        <span className="flex-center"><Calendar size={14} />{booking.date}</span>
                        <span className="flex-center"><Clock size={14} />{booking.time}</span>
                        <span className="flex-center"><MapPin size={14} />{booking.screenName || 'Screen 2, Gold Lounge'}</span>
                      </div>
                      {/* Day 06: Show theatre name if present */}
                      {booking.theatreName && (
                        <div className="booking-theatre-row">
                          {booking.theatreName}
                        </div>
                      )}
                      <div className="booking-seats">
                        Seats: {booking.seats.join(', ')} ({booking.seats.length} Tickets)
                      </div>
                    </div>
                    <div className="booking-ticket">
                      <div className="ticket-code">{booking.id}</div>
                      <div className="ticket-price">₹{booking.totalPrice.toLocaleString('en-IN')}</div>
                      {/* Day 06: FSM Status Badge */}
                      <span className={`ticket-status-badge status-${(booking.status || 'CONFIRMED').toLowerCase()}`}>
                        {booking.status || 'CONFIRMED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- THEATRE OWNER DASHBOARD VIEW -------------------- */}
      {user?.role === 'Theatre Owner' && (
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center owner-icon-bg">
                <DollarSign size={24} />
              </div>
              <div className="stats-info">
                <h3>₹{(bookings.reduce((sum, b) => sum + b.totalPrice, 0) + 124550).toLocaleString('en-IN')}</h3>
                <p>Today's Revenue</p>
              </div>
            </div>

            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center user-icon-bg">
                <Ticket size={24} />
              </div>
              <div className="stats-info">
                <h3>{bookings.length + 18}</h3>
                <p>Active Ticket Bookings</p>
              </div>
            </div>

            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center admin-icon-bg">
                <Film size={24} />
              </div>
              <div className="stats-info">
                <h3>4 / 5</h3>
                <p>Screens Utilized</p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections grid-2">
            {/* Show Management */}
            <div className="main-section glass-panel">
              <div className="section-header flex">
                <h3>Manage Screen Schedules</h3>
                <Link to="/catalog" className="btn-primary btn-sm flex-center">
                  <PlusCircle size={16} /> Manage Movies
                </Link>
              </div>

              <div className="schedules-list">
                {movies.length > 0 ? (
                  movies.slice(0, 6).map((movie, index) => {
                    const screens = [
                      { name: 'Screen 1 • Gold Lounge', times: ['12:30 PM', '03:45 PM', '07:00 PM'] },
                      { name: 'Screen 2 • Standard', times: ['01:00 PM', '04:30 PM', '09:30 PM'] },
                      { name: 'Screen 3 • Premium Dolby', times: ['02:15 PM', '08:00 PM'] },
                      { name: 'Screen 4 • IMAX 3D', times: ['11:00 AM', '03:00 PM', '07:30 PM', '11:00 PM'] },
                      { name: 'Screen 5 • Director\'s Cut', times: ['05:00 PM', '09:00 PM'] },
                    ];
                    const screen = screens[index % screens.length];
                    return (
                      <div key={movie.id || index} className="schedule-item flex">
                        <div className="sched-info">
                          <h4>{movie.title}</h4>
                          <p className="sched-meta">{screen.name}</p>
                        </div>
                        <div className="sched-times flex">
                          {screen.times.map((t, i) => (
                            <span key={i} className={`time-pill ${i === 2 && index === 0 ? 'active' : ''}`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state text-center" style={{ padding: '20px 0' }}>
                    <p>No movies available to schedule.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Reports and Charts */}
            <div className="main-section glass-panel">
              <div className="section-header">
                <h3>Sales Analytics Report</h3>
              </div>

              {/* Premium CSS Chart mockup */}
              <div className="chart-container">
                <div className="chart-bar-wrapper flex">
                  <div className="chart-bar-group flex-center">
                    <div className="chart-bar" style={{ height: '40%' }}>
                      <span className="chart-val">₹14.8K</span>
                    </div>
                    <span className="chart-lbl">Mon</span>
                  </div>
                  <div className="chart-bar-group flex-center">
                    <div className="chart-bar" style={{ height: '55%' }}>
                      <span className="chart-val">₹19.9K</span>
                    </div>
                    <span className="chart-lbl">Tue</span>
                  </div>
                  <div className="chart-bar-group flex-center">
                    <div className="chart-bar" style={{ height: '75%' }}>
                      <span className="chart-val">₹26.6K</span>
                    </div>
                    <span className="chart-lbl">Wed</span>
                  </div>
                  <div className="chart-bar-group flex-center">
                    <div className="chart-bar" style={{ height: '65%' }}>
                      <span className="chart-val">₹23.2K</span>
                    </div>
                    <span className="chart-lbl">Thu</span>
                  </div>
                  <div className="chart-bar-group flex-center">
                    <div className="chart-bar active" style={{ height: '95%' }}>
                      <span className="chart-val">₹39.8K</span>
                    </div>
                    <span className="chart-lbl">Fri</span>
                  </div>
                </div>
              </div>
              <div className="chart-summary flex">
                <div className="chart-stat">
                  <p className="stat-label">Total Weekly Sales</p>
                  <p className="stat-value">₹1,24,300</p>
                </div>
                <div className="chart-stat">
                  <p className="stat-label">Top Movie</p>
                  <p className="stat-value text-gradient">Avengers: Doomsday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ADMIN DASHBOARD VIEW -------------------- */}
      {user?.role === 'Admin' && (
        <div className="dashboard-content">
          <div className="dashboard-grid">
            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center admin-icon-bg">
                <Users size={24} />
              </div>
              <div className="stats-info">
                <h3>{simulatedUsers.length}</h3>
                <p>Simulated Accounts</p>
              </div>
            </div>

            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center owner-icon-bg">
                <ShieldCheck size={24} />
              </div>
              <div className="stats-info">
                <h3>3</h3>
                <p>Access Groups Defined</p>
              </div>
            </div>

            <div className="stats-card glass-panel-interactive">
              <div className="icon-wrapper flex-center level-icon-bg">
                <FileText size={24} />
              </div>
              <div className="stats-info">
                <h3>Active</h3>
                <p>Security Audit Log</p>
              </div>
            </div>
          </div>

          {/* User & Role Management Console */}
          <div className="main-section glass-panel">
            <div className="section-header flex">
              <h3>RBAC Role & Access Management</h3>
              <span className="badge-pill">Admin Console</span>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Assigned Role</th>
                    <th>Access Permissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {simulatedUsers.map(u => (
                    <tr key={u.id}>
                      <td className="user-name-col">
                        <div className="user-avatar">{u.name[0]}</div>
                        {u.name}
                      </td>
                      <td>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="table-role-select"
                        >
                          <option value="User">User</option>
                          <option value="Theatre Owner">Theatre Owner</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="permissions-col">
                        {u.role === 'User' && <span className="perm-pill user">View Movies, Book Seats</span>}
                        {u.role === 'Theatre Owner' && <span className="perm-pill owner">Catalog, Shows, Sales Reports</span>}
                        {u.role === 'Admin' && <span className="perm-pill admin">Full Core System Control</span>}
                      </td>
                      <td>
                        <button className="btn-link" onClick={() => alert(`Reviewing security policies for ${u.name}...`)}>
                          Audit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
