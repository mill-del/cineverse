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
    const [myVotedMovieId, setMyVotedMovieId] = useState(null);
    const [voting, setVoting] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');

        fetch(`${API_URL}/api/votes/current`)
            .then(r => r.json())
            .then(data => { if (data.results) setResults(data.results); })
            .catch(() => {});

        if (token) {
            fetch(`${API_URL}/api/votes/my`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => {
                    if (data.movieId) setMyVotedMovieId(String(data.movieId));
                })
                .catch(() => {});
        }

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
                        if (msg.results) setResults(msg.results);
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
        if (voting) return;

        // Если уже голосовал за этот фильм — ничего не делаем
        if (myVotedMovieId === String(movieId)) return;

        setVoting(true);
        const res = await fetch(`${API_URL}/api/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ movieId })
        });
        const data = await res.json();
        if (!res.ok) {
            alert(data.message || 'Could not vote');
        } else {
            setMyVotedMovieId(String(movieId));
            setShowPicker(false);
            // Результаты придут через WebSocket, но на всякий случай fetch
            fetch(`${API_URL}/api/votes/current`)
                .then(r => r.json())
                .then(data => { if (data.results) setResults(data.results); });
        }
        setVoting(false);
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
                            {showPicker ? 'Close' : myVotedMovieId ? '↻ Change vote' : '+ Nominate a film'}
                        </button>
                    </div>
                    {myVotedMovieId && (
                        <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            ✓ You voted this week — you can change your vote
                        </div>
                    )}
                </div>
            </div>

            {/* MOVIE PICKER */}
            {showPicker && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '2rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            {myVotedMovieId ? 'Change your vote' : 'Choose a film to nominate'}
                        </h3>
                        {myVotedMovieId && (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                Your current vote will be replaced.
                            </p>
                        )}
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
                        {filtered.slice(0, 40).map(movie => {
                            const isMyVote = myVotedMovieId === String(movie._id);
                            return (
                                <div
                                    key={movie._id}
                                    onClick={() => handleVote(movie._id)}
                                    style={{
                                        cursor: isMyVote ? 'default' : 'pointer',
                                        transition: 'transform 0.2s',
                                        position: 'relative',
                                        opacity: isMyVote ? 0.7 : 1
                                    }}
                                    onMouseEnter={e => { if (!isMyVote) e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        aspectRatio: '2/3', borderRadius: '8px', overflow: 'hidden',
                                        background: 'var(--bg-hover)', marginBottom: '0.5rem',
                                        border: `1px solid ${isMyVote ? 'var(--accent)' : 'var(--border)'}`,
                                        position: 'relative'
                                    }}>
                                        {movie.poster && <img src={movie.poster} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        {isMyVote && (
                                            <div style={{
                                                position: 'absolute', inset: 0,
                                                background: 'rgba(232,197,71,0.2)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    background: 'var(--accent)', color: 'var(--bg)',
                                                    borderRadius: '50%', width: 32, height: 32,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1rem', fontWeight: 700
                                                }}>✓</div>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 500, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                        {movie.title}
                                    </div>
                                    {isMyVote && (
                                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginTop: '0.2rem' }}>Your vote</div>
                                    )}
                                </div>
                            );
                        })}
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
                            const isMyVote = myVotedMovieId === String(movie._id);
                            return (
                                <div key={movie._id || i} className="vote-item" style={{
                                    border: isMyVote ? '1px solid rgba(232,197,71,0.4)' : '1px solid var(--border)',
                                    background: isMyVote ? 'rgba(232,197,71,0.04)' : undefined,
                                    borderRadius: 'var(--radius)',
                                    marginBottom: '0.75rem',
                                    padding: '1rem',
                                }}>
                                    <div className="vote-rank" style={{ color: i === 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                                        #{i + 1}
                                    </div>
                                    <img className="vote-poster" src={movie.poster || ''} alt={movie.title} />
                                    <div style={{ flex: 1 }}>
                                        <div className="vote-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {movie.title}
                                            {isMyVote && (
                                                <span style={{
                                                    fontSize: '0.65rem', fontWeight: 600,
                                                    color: 'var(--accent)', background: 'rgba(232,197,71,0.15)',
                                                    border: '1px solid rgba(232,197,71,0.3)',
                                                    padding: '0.15rem 0.5rem', borderRadius: '100px',
                                                    letterSpacing: '0.05em'
                                                }}>YOUR VOTE</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{movie.year}</div>
                                    </div>
                                    <div className="vote-bar-wrap">
                                        <div className="vote-bar" style={{
                                            width: `${(count / maxCount) * 100}%`,
                                            background: isMyVote ? 'var(--accent)' : undefined
                                        }} />
                                    </div>
                                    <div className="vote-count-small">{count}</div>
                                    <button
                                        className={`btn ${isMyVote ? 'btn-primary' : 'btn-outline'}`}
                                        onClick={() => isMyVote ? null : handleVote(movie._id)}
                                        disabled={isMyVote || voting}
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', opacity: isMyVote ? 0.6 : 1 }}
                                    >
                                        {isMyVote ? '✓ Voted' : 'Vote'}
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