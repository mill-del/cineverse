'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const TABS = ['watched', 'watchlist', 'favorites', 'clubs'];

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [clubs, setClubs] = useState([]);
    const [activeTab, setActiveTab] = useState('watched');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }

        fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setUser(data.user))
            .catch(() => {});

        // Подтягиваем клубы пользователя
        fetch(`${API_URL}/api/clubs`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const stored = localStorage.getItem('user');
                const me = stored ? JSON.parse(stored) : null;
                if (!me) return;
                const all = Array.isArray(data) ? data : data.clubs || [];
                setClubs(all.filter(c => c.members?.some(m => m === me._id || m?._id === me._id)));
            })
            .catch(() => {});
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    if (!user) return <p className="loading-state">Loading...</p>;

    const currentList = activeTab !== 'clubs' ? (user[activeTab] || []) : [];
    const bgPosters = [
        ...(user.favorites || []),
        ...(user.watched || []),
        ...(user.watchlist || [])
    ].filter(m => m?.poster).slice(0, 5);

    const tabCount = (tab) => {
        if (tab === 'clubs') return clubs.length;
        return user[tab]?.length || 0;
    };

    const tabIcon = (tab) => {
        if (tab === 'watched') return '✓';
        if (tab === 'watchlist') return '◷';
        if (tab === 'favorites') return '♥';
        if (tab === 'clubs') return '◆';
    };

    return (
        <>
            {/* HERO */}
            <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: '2.5rem',
                border: '1px solid var(--border)',
                minHeight: '280px'
            }}>
                {/* Collage background */}
                {bgPosters.length > 0 && (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                        {bgPosters.map((m, i) => (
                            <div key={i} style={{
                                flex: 1,
                                backgroundImage: `url(${m.poster})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'brightness(0.15)',
                            }} />
                        ))}
                    </div>
                )}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.4) 100%)'
                }} />

                <div style={{ position: 'relative', zIndex: 1, padding: '3rem', display: 'grid', gridTemplateColumns: 'auto 1fr auto auto', gap: '2rem', alignItems: 'center' }}>
                    {/* AVATAR */}
                    <div style={{
                        width: '110px', height: '110px', borderRadius: '50%',
                        background: 'var(--bg-card)', border: '2px solid rgba(232,197,71,0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', fontWeight: 700, overflow: 'hidden', flexShrink: 0,
                        boxShadow: '0 0 40px rgba(232,197,71,0.1)'
                    }}>
                        {user.avatar
                            ? <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : user.username?.[0]?.toUpperCase()
                        }
                    </div>

                    {/* INFO */}
                    <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                            CineClub Member
                        </div>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '0.6rem' }}>
                            {user.username}
                        </h1>
                        <p style={{
                            color: 'var(--text-secondary)', fontStyle: 'italic',
                            fontFamily: 'Instrument Serif, serif', fontSize: '1.1rem', marginBottom: '2rem'
                        }}>
                            "{user.bio || 'A lover of cinema.'}"
                        </p>

                        {/* STATS */}
                        <div style={{ display: 'flex', gap: '2.5rem' }}>
                            {[
                                { label: 'Films watched', val: user.watched?.length || 0 },
                                { label: 'Watchlist', val: user.watchlist?.length || 0 },
                                { label: 'Favorites', val: user.favorites?.length || 0 },
                                { label: 'Clubs', val: clubs.length },
                            ].map(s => (
                                <div key={s.label}>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1, marginBottom: '0.25rem' }}>
                                        {s.val}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignSelf: 'flex-start' }}>
                        <a href="/profile/edit" className="btn btn-outline">Edit profile</a>
                        <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
                    </div>
                </div>

                {/* Poster strip */}
                {bgPosters.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'center' }}>
                        {bgPosters.slice(0, 3).map((m, i) => (
                            <img key={i} src={m.poster} alt="" style={{
                                height: i === 1 ? '140px' : '110px',
                                width: 'auto', borderRadius: '8px',
                                opacity: i === 1 ? 0.9 : 0.4,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                                transform: i === 0 ? 'rotate(-3deg)' : i === 2 ? 'rotate(3deg)' : 'none',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }} />
                        ))}
                    </div>
                )}
            </div>

            {/* TABS */}
            <div style={{display: 'flex', gap: '0.4rem', marginBottom: '2.5rem', flexWrap: 'wrap'}}>
                {TABS.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '100px',
                            border: `1px solid ${activeTab === tab ? 'var(--text)' : 'var(--border)'}`,
                            background: activeTab === tab ? 'var(--text)' : 'var(--bg-card)',
                            color: activeTab === tab ? 'var(--bg)' : 'var(--text-secondary)',
                            fontSize: '0.88rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontFamily: 'inherit'
                        }}
                    >
                        <span style={{ opacity: 0.7 }}>{tabIcon(tab)}</span>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        <span style={{
                            background: activeTab === tab ? 'rgba(0,0,0,0.15)' : 'var(--bg-hover)',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '100px',
                            fontSize: '0.75rem'
                        }}>
              {tabCount(tab)}
            </span>
                    </button>
                ))}
            </div>

            {/* CONTENT */}
            {activeTab === 'clubs' ? (
                clubs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎭</div>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Not a member of any clubs yet.</p>
                        <a href="/clubs" className="btn btn-outline">Browse clubs</a>
                    </div>
                ) : (
                    <div className="clubs-grid">
                        {clubs.map((club, i) => (
                            <a href={`/clubs/${club._id}`} key={club._id} className="club-card">
                                <div className="club-cover" style={{
                                    background: club.coverUrl
                                        ? `linear-gradient(to bottom, transparent 30%, rgba(17,17,17,0.95) 100%), url(${club.coverUrl}) center/cover`
                                        : `linear-gradient(135deg, #1a1a2e, #16213e)`,
                                }} />
                                <div className="club-info">
                                    {club.theme && <div className="club-theme">{club.theme}</div>}
                                    <div className="club-name">{club.name}</div>
                                    <div className="club-description">{club.description || 'A community of film lovers.'}</div>
                                    <div className="club-members">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                                        {club.members?.length || 0} members
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )
            ) : currentList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                        {activeTab === 'watched' ? '🎬' : activeTab === 'watchlist' ? '📋' : '❤️'}
                    </div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                        {activeTab === 'watched' ? 'No films watched yet.' : activeTab === 'watchlist' ? 'Your watchlist is empty.' : 'No favorites yet.'}
                    </p>
                    <a href="/" className="btn btn-outline">Browse films</a>
                </div>
            ) : (
                <div className="profile-movies">
                    {currentList.map(movie => (
                        <a href={`/movies/${movie._id}`} key={movie._id} className="movie-card">
                            <div className="movie-poster-wrap">
                                {movie.poster
                                    ? <img src={movie.poster} alt={movie.title} />
                                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No image</div>
                                }
                                {movie.rating > 0 && (
                                    <span className="movie-rating-badge">★ {movie.rating?.toFixed(1)}</span>
                                )}
                            </div>
                            <div className="movie-info">
                                <div className="movie-title">{movie.title}</div>
                                <div className="movie-meta">{movie.year}</div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </>
    );
}