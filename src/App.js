import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
// Make sure you import the CSS file!
import './App.css'; 

// --- [ 1. CONFIGURATION & MOCK DATA ] --------------------------------------

const PRIMARY_COLOR_CLASS = 'text-red-primary';
const BG_COLOR_CLASS = 'bg-red-primary';
const STORAGE_KEY = 'club_mgmt_demo_v3';
const ADMIN_PIN = '1234';
const MOCK_USER_NAME = 'Demo Student';

const SAMPLE_CLUBS = [
  {
    id: 'robotics',
    name: 'Robotics Engineering Club',
    president: 'Aisha Khan',
    presidentPhoto: 'https://i.pravatar.cc/150?img=47',
    tagline: 'Build, program, innovate.',
    description: 'Focuses on hands-on robotics, competitive challenges, and advanced workshops in AI and mechanics.',
    activities: [
      { id: 'r1', title: 'Q1 Robot Showcase', date: '2025-03-01', img: 'https://picsum.photos/seed/r1/400/250' },
      { id: 'r2', title: 'Inter-uni Challenge Finals', date: '2025-05-12', img: 'https://picsum.photos/seed/r2/400/250' }
    ]
  },
  {
    id: 'arts',
    name: 'Arts & Design Collective',
    president: 'Fatima Noor',
    presidentPhoto: 'https://i.pravatar.cc/150?img=12',
    tagline: 'Create and display campus culture.',
    description: "Hosts campus exhibitions, open craft sessions, and design competitions across various mediums.",
    activities: [
      { id: 'a1', title: 'Spring Campus Exhibit', date: '2025-02-20', img: 'https://picsum.photos/seed/a1/400/250' }
    ]
  }
];

// --- [ 2. DATA UTILITIES (Local Storage Mock Backend) ] ---------------------

function useStorageData() {
  const [data, setData] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
    return {
      clubs: SAMPLE_CLUBS,
      events: [
        { id: 'e1', clubId: 'robotics', title: 'New Member Orientation', date: '2025-09-28', venue: 'Auditorium A' },
        { id: 'e2', clubId: 'robotics', title: 'AI Ethics Talk', date: '2025-10-15', venue: 'Lab 3' },
        { id: 'e3', clubId: 'arts', title: 'Watercolor Workshop', date: '2025-10-05', venue: 'Gallery Studio' }
      ],
      members: []
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  return [data, setData];
}

// --- [ 3. MAIN SHELL & NAVIGATION ] ----------------------------------------

/**
 * Global application frame with Header and Footer.
 */
function AppShell({ children, onOpenAdmin }) {
  const navLinkClass = `nav-link ${PRIMARY_COLOR_CLASS}`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo-container">
            <div className={`logo-icon ${BG_COLOR_CLASS}`}>U</div>
            <div>
              <div className="logo-title">Club Connect</div>
              <div className="logo-subtitle">The Everlasting Student System</div>
            </div>
          </Link>
          <nav className="header-nav">
            <Link to="/discover" className={navLinkClass}>Discover</Link>
            <Link to="/calendar" className={navLinkClass}>Calendar</Link>
            <Link to="/updates" className={navLinkClass}>My Updates</Link>
            <button 
                onClick={onOpenAdmin} 
                className={`admin-button ${PRIMARY_COLOR_CLASS}`}
            >
                Admin
            </button>
          </nav>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="app-footer">
        Club Connect Demo • Built for University Students
      </footer>
    </div>
  );
}

// --- [ 4. PAGES/VIEWS ] ----------------------------------------------------

/**
 * Club Listing Page (Discover)
 */
function Home({ data }) {
  const clubs = data.clubs;
  
  return (
    <div className="page-container">
      <h1 className={`page-title ${PRIMARY_COLOR_CLASS}`}>Explore University Clubs</h1>
      <p className="page-description">
          Scan a club's QR code on campus or browse below to see their profile, view past records, and join the community.
      </p>

      <section className="club-grid">
        {clubs.map((c) => (
          <div key={c.id} className="club-card">
            <div className="club-header">
              <img src={c.presidentPhoto} alt={`${c.president} photo`} className="president-photo" />
              <div className="club-info">
                <div className={`club-name ${PRIMARY_COLOR_CLASS}`}>{c.name}</div>
                <div className="club-tagline">{c.tagline}</div>
              </div>
            </div>
            
            <div className="club-body">
                <p className="club-description">{c.description}</p>
            </div>

            <div className="club-footer">
                <div className="club-president">President: <span>{c.president}</span></div>
                <Link 
                    to={`/club/${encodeURIComponent(c.id.trim())}`} 
                    className={`primary-button ${BG_COLOR_CLASS}`}
                >
                    View Club
                </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

/**
 * Club Profile Page (QR Scan Destination)
 */
function ClubPage({ data, setData }) {
  const { id } = useParams();
  const clubId = decodeURIComponent(id).trim();
  const club = data.clubs.find(c => c.id.trim() === clubId);
  const navigate = useNavigate();

  if (!club) return <div className="not-found">Club not found. <button onClick={() => navigate(-1)} className={PRIMARY_COLOR_CLASS}>Go back</button></div>;

  const clubEvents = data.events.filter(e => e.clubId.trim() === clubId);
  const isMember = data.members.some(m => m.clubId.trim() === clubId && m.name === MOCK_USER_NAME);

  const handleJoin = () => {
    const newMember = { id: Math.random().toString(36).slice(2), clubId: club.id, name: MOCK_USER_NAME, joinedAt: new Date().toISOString() };
    setData(prev => ({ ...prev, members: [...prev.members, newMember] }));
    alert(`Successfully joined ${club.name}! You can now see updates in your "My Updates" feed.`);
  };

  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(window.location.origin + '/club/' + encodeURIComponent(club.id.trim()))}`;

  return (
    <div className="club-profile-container">
      <div className="club-profile-header">
        <img src={club.presidentPhoto} alt="President" className="profile-president-photo" />
        
        <div className="profile-info">
          <h2 className={`profile-title ${PRIMARY_COLOR_CLASS}`}>{club.name}</h2>
          <div className="profile-tagline">{club.tagline}</div>
          <p className="profile-description">{club.description}</p>
          
          <div className="profile-actions">
            {isMember ? (
                <span className="joined-status">✅ You are a Member!</span>
            ) : (
                <button onClick={handleJoin} className={`primary-button large ${BG_COLOR_CLASS}`}>
                    Join Club
                </button>
            )}
            <a target="_blank" rel="noreferrer" href={qrCodeUrl} className="secondary-button">Get QR Code</a>
          </div>
        </div>
      </div>
      
      {/* Upcoming & Recent Events Section */}
      <section className="profile-section">
        <h3 className={`section-title ${PRIMARY_COLOR_CLASS}`}>Upcoming Events</h3>
        <div className="event-list-grid">
          {clubEvents.map(ev => (
            <div key={ev.id} className="event-item">
              <div className="event-title">{ev.title}</div>
              <div className="event-date">{dayjs(ev.date).format('dddd, MMM D, YYYY')}</div>
              <div className="event-venue">Venue: {ev.venue}</div>
            </div>
          ))}
          {clubEvents.length === 0 && <div className="empty-state">No upcoming events scheduled.</div>}
        </div>
      </section>

      {/* Activities/Gallery Section (Records) */}
      <section className="profile-section">
        <h3 className={`section-title ${PRIMARY_COLOR_CLASS}`}>Activity Record & Gallery</h3>
        <div className="gallery-grid">
          {club.activities.map(a => (
            <div key={a.id} className="gallery-item">
              <img src={a.img} alt={a.title} className="gallery-image" />
              <div className="gallery-caption">
                <div className="gallery-title">{a.title}</div>
                <div className="gallery-date">{dayjs(a.date).format('MMM YYYY')}</div>
              </div>
            </div>
          ))}
          {club.activities.length === 0 && <div className="empty-state">No activity records yet.</div>}
        </div>
      </section>
    </div>
  );
}

/**
 * Global Calendar View
 */
function CalendarView({ data }) {
  const [filterClub, setFilterClub] = useState('all');
  const events = data.events.filter(e => filterClub === 'all' ? true : e.clubId.trim() === filterClub.trim());

  const grouped = events.reduce((acc, ev) => {
    acc[ev.date] = acc[ev.date] || [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="page-container">
      <h2 className={`page-title ${PRIMARY_COLOR_CLASS}`}>Club Events Calendar</h2>
      <div className="calendar-filter-bar">
        <label className="filter-label">Filter by Club:</label>
        <select value={filterClub} onChange={e => setFilterClub(e.target.value)} className="filter-select">
          <option value="all">All University Clubs</option>
          {data.clubs.map(c => <option key={c.id} value={c.id.trim()}>{c.name}</option>)}
        </select>
      </div>

      <div className="calendar-list">
        {sortedDates.map(d => (
          <div key={d} className="calendar-day-group">
            <div className="calendar-date-header">{dayjs(d).format('dddd, MMMM D, YYYY')}</div>
            <div className="calendar-events-list">
              {grouped[d].map(ev => {
                const club = data.clubs.find(c => c.id.trim() === ev.clubId.trim());
                return (
                  <div key={ev.id} className="calendar-event-item">
                    <div className="event-details">
                      <div className="event-title">{ev.title}</div>
                      <div className="event-venue">📍 {ev.venue}</div>
                    </div>
                    <Link to={`/club/${encodeURIComponent(club?.id.trim())}`} className={`event-club-link ${PRIMARY_COLOR_CLASS}`}>
                      {club?.name}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {sortedDates.length === 0 && <div className="empty-state">No events scheduled for the selected filter.</div>}
      </div>
    </div>
  );
}

/**
 * Personalized Updates Feed (for Joined Clubs)
 */
function UpdatesFeed({ data }) {
  const studentMemberships = data.members.filter(m => m.name === MOCK_USER_NAME);
  const joinedClubIds = studentMemberships.map(m => m.clubId.trim());

  const clubActivities = data.clubs
    .filter(c => joinedClubIds.includes(c.id.trim()))
    .flatMap(c => c.activities.map(a => ({
      ...a, type: 'Activity Record', clubName: c.name,
      sortDate: dayjs(a.date).valueOf(), link: `/club/${encodeURIComponent(c.id.trim())}`
    })));

  const clubEvents = data.events
    .filter(e => joinedClubIds.includes(e.clubId.trim()))
    .map(e => {
      const club = data.clubs.find(c => c.id.trim() === e.clubId.trim());
      return {
        ...e, type: 'Upcoming Event', clubName: club?.name || 'Unknown Club',
        sortDate: dayjs(e.date).valueOf(), link: `/calendar`
      };
    });

  const allUpdates = [...clubActivities, ...clubEvents].sort((a, b) => b.sortDate - a.sortDate);

  return (
    <div className="page-container">
      <h2 className={`page-title ${PRIMARY_COLOR_CLASS}`}>My Club Updates ({MOCK_USER_NAME})</h2>
      <p className="page-description">
          A personalized feed showing new event announcements and recent activity records from the clubs you follow.
      </p>

      {allUpdates.length === 0 ? (
        <div className="updates-empty-state">
          <p className="updates-empty-title">Nothing in your feed yet!</p>
          <p>You haven't joined any clubs, or they haven't posted recent updates.</p>
          <Link to="/discover" className={`updates-explore-link ${PRIMARY_COLOR_CLASS}`}>
            Start Discovering Clubs
          </Link>
        </div>
      ) : (
        <div className="updates-list">
          {allUpdates.map((item, index) => (
            <div key={index} className="update-item">
              <div className="update-content">
                <div className="update-title">{item.title}</div>
                <div className="update-meta">
                  <span className={PRIMARY_COLOR_CLASS}>[{item.type}]</span> from **{item.clubName}**
                </div>
                <div className="update-date">
                  Date: **{dayjs(item.date).format('MMMM D, YYYY')}**
                  {item.venue && ` • Venue: ${item.venue}`}
                </div>
              </div>
              <Link 
                  to={item.link} 
                  className={`update-action-button ${PRIMARY_COLOR_CLASS}`}
              >
                  {item.type.includes('Event') ? 'View Calendar' : 'View Club'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- [ 5. ADMIN SECTION (Mocked) ] -----------------------------------------

/**
 * Admin Panel for Data Management (Protected by PIN)
 */
function AdminPanel({ data, setData }) {
  const [secret, setSecret] = useState('');

  if (secret !== ADMIN_PIN) {
    return (
      <div className="admin-login-card">
        <h2 className={`admin-login-title ${PRIMARY_COLOR_CLASS}`}>Admin Access Required</h2>
        <p className="admin-login-info">Enter admin pin to edit clubs and events (Demo pin is **{ADMIN_PIN}**).</p>
        <input 
            type="password"
            value={secret} 
            onChange={e => setSecret(e.target.value)} 
            placeholder="Enter Admin Pin" 
            className="admin-input" 
        />
        <button onClick={() => setSecret(ADMIN_PIN)} className={`primary-button wide ${BG_COLOR_CLASS}`}>
            Unlock Demo Admin
        </button>
      </div>
    );
  }

  const addClub = () => {
    const name = prompt('Enter Club Name:');
    if (!name) return;
    const id = name.toLowerCase().replace(/\s/g, '_');
    const newClub = { id, name, president: 'New President', presidentPhoto: 'https://i.pravatar.cc/150?img=55', tagline: 'New Club Tagline', description: 'Detailed description...', activities: [] };
    setData(prev => ({ ...prev, clubs: [...prev.clubs, newClub] }));
    alert(`Club "${name}" created with ID: ${id}`);
  };

  const addEvent = () => {
    const clubId = prompt('Enter Club ID (e.g., robotics):');
    const title = prompt('Event Title:');
    const date = prompt('Event Date (YYYY-MM-DD):');
    const venue = prompt('Venue:');
    if (!clubId || !title || !date) return alert('Missing required fields.');
    const ev = { id: 'ev_' + Math.random().toString(36).slice(2,8), clubId, title, date, venue };
    setData(prev => ({ ...prev, events: [...prev.events, ev] }));
    alert(`Event added for club ${clubId}`);
  };

  return (
    <div className="admin-dashboard-container">
      <h2 className={`admin-dashboard-title ${PRIMARY_COLOR_CLASS}`}>🔐 Full Admin Dashboard</h2>
      <div className="admin-actions-bar">
        <button onClick={addClub} className={`primary-button ${BG_COLOR_CLASS}`}>+ Add New Club</button>
        <button onClick={addEvent} className="secondary-button">+ Add New Event</button>
        <button onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }} className="tertiary-button">Reset Demo Data</button>
      </div>

      <div className="admin-data-grid">
        <div className="admin-club-list">
          <div className="list-title">Clubs ({data.clubs.length})</div>
          <div className="list-items">
            {data.clubs.map(c => (
              <div key={c.id} className="list-item">
                <img src={c.presidentPhoto} alt="p" className="list-photo" />
                <div>
                  <div className="list-item-title">{c.name}</div>
                  <div className="list-item-meta">ID: {c.id}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="admin-event-list">
          <div className="list-title">Events ({data.events.length})</div>
          <div className="list-items">
            {data.events.map(e => {
                const club = data.clubs.find(c => c.id.trim() === e.clubId.trim());
                return (
                    <div key={e.id} className="list-item-event">
                        <div className="event-title">{e.title}</div>
                        <div className="event-meta">{dayjs(e.date).format('MMM D, YYYY')} • {e.venue}</div>
                        <div className="event-club-name">{club?.name || 'Unknown Club'}</div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- [ 6. MAIN APPLICATION WRAPPER ] ---------------------------------------

export default function App() {
  const [data, setData] = useStorageData();
  const [showAdmin, setShowAdmin] = useState(false);

return (
    <Router basename="/clubs-management">
      <AppShell onOpenAdmin={() => setShowAdmin(true)}>
        <Routes>
          {/* Redirect root to /discover */}
          <Route path="/" element={<Navigate to="/discover" replace />} />
          <Route path="/discover" element={<Home data={data} />} />
          <Route path="/club/:id" element={<ClubPage data={data} setData={setData} />} />
          <Route path="/calendar" element={<CalendarView data={data} />} />
          <Route path="/updates" element={<UpdatesFeed data={data} />} />
          <Route path="/admin" element={<AdminPanel data={data} setData={setData} />} />
        </Routes>

        {showAdmin && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className={PRIMARY_COLOR_CLASS}>Administrative Access</h3>
                <button
                  onClick={() => setShowAdmin(false)}
                  className="modal-close-button"
                >
                  Close (X)
                </button>
              </div>
              <AdminPanel data={data} setData={setData} />
            </div>
          </div>
        )}
      </AppShell>
    </Router>
  );
}

