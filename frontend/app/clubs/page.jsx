'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const gradients = [
    'linear-gradient(135deg, #1a1a2e, #16213e)',
    'linear-gradient(135deg, #1a0a0a, #2d1515)',
    'linear-gradient(135deg, #0a1a0a, #152d15)',
    'linear-gradient(135deg, #1a1500, #2d2600)',
    'linear-gradient(135deg, #0a0a1a, #15152d)',
    'linear-gradient(135deg, #1a000a, #2d0015)',
];

export default function ClubsPage() {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/clubs`)
            .then(r => r.json())
            .then(data => { setClubs(Array.isArray(data) ? data : data.clubs || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const filtered = clubs.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            {/* HEADER */}
            <div style={{ paddingBottom: '3rem', marginBottom: '3rem', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'end', gap: '2rem' }}>
                <div>
                    <div className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>Communities</div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: '1rem' }}>
                        Cinema <span className="serif" style={{ color: 'var(--accent)', fontStyle: 'italic' }}>clubs</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '500px' }}>
                        Find your people. Join clubs of fellow cinephiles who share your taste.
                    </p>
                </div>
                <a href="/clubs/new" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>+ Create club</a>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search clubs by name..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p className="loading-state">Loading clubs...</p>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>No clubs yet. Start the first one.</p>
                    <a href="/clubs/new" className="btn btn-primary">Create a club</a>
                </div>
            ) : (
                <div className="clubs-grid">
                    {filtered.map((club, i) => (
                        <a href={`/clubs/${club._id}`} key={club._id} className="club-card">
                            <div
                                className="club-cover"
                                style={{
                                    background: club.coverUrl
                                        ? `linear-gradient(to bottom, transparent 30%, rgba(17,17,17,0.95) 100%), url(${club.coverUrl}) center/cover`
                                        : gradients[i % gradients.length],
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    padding: '1rem',
                                }}
                            >
                                {!club.coverUrl && (
                                    <div style={{ fontSize: '2.5rem', opacity: 0.15, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                                        🎬
                                    </div>
                                )}
                            </div>
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
            )}
        </>
    );
}