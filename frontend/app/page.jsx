'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function HomePage() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [genre, setGenre] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/movies`)
            .then(r => r.json())
            .then(data => {
                setMovies(Array.isArray(data) ? data : data.movies || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filtered = movies.filter(m => {
        const matchSearch = !search || m.title?.toLowerCase().includes(search.toLowerCase()) || m.director?.toLowerCase().includes(search.toLowerCase());
        const matchGenre = !genre || m.genres?.includes(genre);
        return matchSearch && matchGenre;
    });

    const featured = movies[0];

    return (
        <>
            {/* HERO */}
            {featured && (
                <section className="hero">
                    {/* Background poster blur */}
                    {featured.poster && (
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundImage: `url(${featured.poster})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            filter: 'blur(60px) brightness(0.15)',
                            transform: 'scale(1.1)',
                            zIndex: 0,
                            borderRadius: 'inherit'
                        }} />
                    )}

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div className="hero-badge">Film of the week</div>
                        <h1>
                            Discover<br />
                            <span className="serif">{featured.title}</span>
                        </h1>
                        <p>
                            {featured.description?.slice(0, 120)}...
                        </p>
                        <div className="hero-actions">
                            <a href={`/movies/${featured._id}`} className="btn btn-primary">View film →</a>
                            <a href="/vote" className="btn btn-outline">Vote now</a>
                        </div>
                    </div>

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1.5rem' }}>
                        {featured.poster && (
                            <img
                                src={featured.poster}
                                alt={featured.title}
                                style={{
                                    width: '200px',
                                    aspectRatio: '2/3',
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}
                            />
                        )}
                        <div className="hero-vote">
                            <div className="hero-vote-label">live votes this week</div>
                            <div className="hero-vote-count">247</div>
                            <div className="hero-vote-status">
                                <span className="live-dot"></span>
                                Updated in real time
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* CATALOG */}
            <div className="section-header">
                <div>
                    <div className="section-eyebrow">The Collection</div>
                    <h2 className="section-title">Browse <span className="serif">films</span></h2>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {filtered.length} titles
        </span>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search films, directors..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="filter-select" value={genre} onChange={e => setGenre(e.target.value)}>
                    <option value="">All genres</option>
                    {['Action','Adventure','Animation','Comedy','Crime','Drama','Fantasy','Horror','Mystery','Romance','Sci-Fi','Thriller','War'].map(g => (
                        <option key={g} value={g}>{g}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <p className="loading-state">Loading films...</p>
            ) : (
                <div className="movies-grid">
                    {filtered.map(movie => (
                        <a href={`/movies/${movie._id}`} key={movie._id} className="movie-card">
                            <div className="movie-poster-wrap">
                                {movie.poster ? (
                                    <img src={movie.poster} alt={movie.title} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        No image
                                    </div>
                                )}
                                {movie.rating > 0 && (
                                    <span className="movie-rating-badge">★ {movie.rating.toFixed(1)}</span>
                                )}
                            </div>
                            <div className="movie-info">
                                <div className="movie-title">{movie.title}</div>
                                <div className="movie-meta">
                                    <span>{movie.year}</span>
                                    {movie.genres?.[0] && (
                                        <>
                                            <span className="movie-meta-divider">·</span>
                                            <span>{movie.genres[0]}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </>
    );
}