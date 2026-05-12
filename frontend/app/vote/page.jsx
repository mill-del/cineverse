'use client';

import { useEffect, useState, useRef } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const WS_URL = API_URL.replace('http', 'ws') + '/ws/votes';

export default function VotePage() {
    const [results, setResults] = useState([]);
    const [online, setOnline] = useState(0);
    const [movies, setMovies] = useState([]);
    const [search, setSearch] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        fetch(`${API_URL}/api/votes/current`)
            .then(r => r.json())
            .then(data => { if (data.results) setResults(data.results); })
            .catch(() => {});

        fetch(`${API_URL}/api/movies`)
            .then(r => r.json())
            .then(data => setMovies(Array.isArray(data) ? data : data.movies || []))
            .catch(() => {});

        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;
            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'online') setOnline(msg.count);
                    if (msg.type === 'results') {
                        if (msg.votes) setResults(msg.votes);
                        if (typeof msg.online === 'number') setOnline(msg.online);
                    }
                } catch {}
            };
            return () => ws.close();
        } catch {}
    }, []);

    const handleVote = async (movieId) => {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        const res = await fetch(`${API_URL}/api/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ movieId })
        });
        const data = await res.json();
        if (!res.ok) alert(data.message || 'Could not vote');
        else {
            setShowPicker(false);
            fetch(`${API_URL}/api/votes/current`)
                .then(r => r.json())
                .then(data => { if (data.results) setResults(data.results); });
        }
    };

    const maxCount = Math.max(...results.map(r => r.count || 0), 1);
    const filtered = movies.filter(m => !search || m.title?.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            {/* BANNER */}
            <div className="vote-banner">
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(232,197,71,0.1), transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div className="section-eyebrow" style={{ marginBottom: '1rem' }}>Weekly Poll</div>
                    <h1 className="vote-banner-title">
                        Film of the <span className="serif" style={{ color: 'var(--accent)', fontStyle: 'italic' }}>week</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '1rem auto 0', fontSize: '1rem' }}>
                        Vote for the film you think deserves the spotlight this week.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                        <div className="vote-banner-online">
                            <span className="live-dot"></span>
                            {online} {online === 1 ? 'person' : 'people'} voting now
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowPicker(v => !v)}>
                            {showPicker ? 'Close' : '+ Nominate a film'}
                        </button>
                    </div>
                </div>
            </div>

            {/* MOVIE PICKER */}
            {showPicker && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Choose a film to nominate</h3>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search films..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ maxWidth: '400px' }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                        {filtered.slice(0, 40).map(movie => (
                            <div
                                key={movie._id}
                                onClick={() => handleVote(movie._id)}
                                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ aspectRatio: '2/3', borderRadius: '8px', overflow: 'hidden', background: 'var(--bg-hover)', marginBottom: '0.5rem', border: '1px solid var(--border)' }}>
                                    {movie.poster && <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                    {movie.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* RESULTS */}
            {results.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1.5rem' }}>No votes yet this week.</p>
                    <button className="btn btn-primary" onClick={() => setShowPicker(true)}>Be the first to nominate</button>
                </div>
            ) : (
                <div>
                    <div className="section-eyebrow" style={{ marginBottom: '1.5rem' }}>Current standings</div>
                    <div className="vote-list">
                        {results.map((r, i) => {
                            const movie = r.movieId || r;
                            const count = r.count || 0;
                            return (
                                <div key={movie._id || i} className="vote-item">
                                    <div className="vote-rank" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                        #{i + 1}
                                    </div>
                                    <img className="vote-poster" src={movie.poster || ''} alt={movie.title} />
                                    <div>
                                        <div className="vote-title">{movie.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{movie.year}</div>
                                    </div>
                                    <div className="vote-bar-wrap">
                                        <div className="vote-bar" style={{ width: `${(count / maxCount) * 100}%` }} />
                                    </div>
                                    <div className="vote-count-small">{count}</div>
                                    <button className="btn btn-outline" onClick={() => handleVote(movie._id)} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                        Vote
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </>
    );
}