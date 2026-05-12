'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function MoviePage() {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userLists, setUserLists] = useState({ watched: [], watchlist: [], favorites: [] });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(8);
    const [submitting, setSubmitting] = useState(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    useEffect(() => {
        fetch(`${API_URL}/api/movies/${id}`)
            .then(r => r.json())
            .then(data => { setMovie(data); setLoading(false); })
            .catch(() => setLoading(false));

        if (token) {
            fetch(`${API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => setUserLists({
                    watched: data.watched || [],
                    watchlist: data.watchlist || [],
                    favorites: data.favorites || []
                }))
                .catch(() => {});
        }
    }, [id]);

    const isInList = (list) => userLists[list]?.some(m => m === id || m?._id === id);

    const handleList = async (list) => {
        if (!token) { window.location.href = '/login'; return; }
        const action = isInList(list) ? 'remove' : 'add';
        const res = await fetch(`${API_URL}/api/movies/${id}/lists`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ list, action })
        });
        if (res.ok) {
            const data = await res.json();
            setUserLists({ watched: data.watched || [], watchlist: data.watchlist || [], favorites: data.favorites || [] });
        }
    };

    const handleReview = async (e) => {
        e.preventDefault();
        if (!token) { window.location.href = '/login'; return; }
        setSubmitting(true);
        const res = await fetch(`${API_URL}/api/movies/${id}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ rating: reviewRating, text: reviewText })
        });
        const data = await res.json();
        if (res.ok) {
            setMovie(prev => ({ ...prev, reviews: [data, ...(prev.reviews || [])] }));
            setShowReviewForm(false);
            setReviewText('');
        } else {
            alert(data.message || 'Could not submit review');
        }
        setSubmitting(false);
    };

    if (loading) return <p className="loading-state">Loading...</p>;
    if (!movie) return <p className="loading-state">Movie not found</p>;

    return (
        <div>
            <div className="movie-detail">
                <div className="movie-detail-poster">
                    {movie.poster
                        ? <img src={movie.poster} alt={movie.title} />
                        : <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No image</div>
                    }
                </div>

                <div className="movie-detail-info">
                    <div className="movie-detail-year">{movie.year}</div>
                    <h1>{movie.title}</h1>

                    <div className="movie-detail-meta">
                        {movie.rating > 0 && (
                            <span className="movie-detail-rating">★ {movie.rating.toFixed(1)}</span>
                        )}
                        {movie.director && <span>Dir. {movie.director}</span>}
                    </div>

                    <p className="movie-detail-desc">{movie.description}</p>

                    {movie.genres?.length > 0 && (
                        <div className="movie-detail-genres">
                            {movie.genres.map(g => <span key={g} className="genre-tag">{g}</span>)}
                        </div>
                    )}

                    {movie.cast?.length > 0 && (
                        <div className="movie-detail-credits">
                            <div className="credit-row">
                                <span className="credit-label">Cast</span>
                                <span className="credit-value">{movie.cast.join(', ')}</span>
                            </div>
                        </div>
                    )}

                    <div className="movie-actions">
                        <button
                            className={`btn ${isInList('watched') ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleList('watched')}
                        >
                            {isInList('watched') ? '✓ Watched' : 'Watched'}
                        </button>
                        <button
                            className={`btn ${isInList('watchlist') ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleList('watchlist')}
                        >
                            {isInList('watchlist') ? '✓ Watchlist' : '+ Watchlist'}
                        </button>
                        <button
                            className={`btn ${isInList('favorites') ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => handleList('favorites')}
                        >
                            {isInList('favorites') ? '♥ Favorited' : '♡ Favorite'}
                        </button>
                    </div>
                </div>
            </div>

            {/* REVIEWS */}
            <div className="reviews-section">
                <div className="section-header">
                    <div>
                        <div className="section-eyebrow">Community</div>
                        <h2 className="section-title">Reviews</h2>
                    </div>
                    <button className="btn btn-outline" onClick={() => setShowReviewForm(v => !v)}>
                        {showReviewForm ? 'Cancel' : 'Write a review'}
                    </button>
                </div>

                {showReviewForm && (
                    <form onSubmit={handleReview} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <label className="form-label" style={{ margin: 0 }}>Rating:</label>
                            <select
                                value={reviewRating}
                                onChange={e => setReviewRating(Number(e.target.value))}
                                className="filter-select"
                                style={{ borderRadius: '8px' }}
                            >
                                {[10,9,8,7,6,5,4,3,2,1].map(n => (
                                    <option key={n} value={n}>{n}/10</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            className="form-input"
                            rows={4}
                            placeholder="Share your thoughts..."
                            required
                            minLength={10}
                            style={{ borderRadius: '10px', resize: 'vertical' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={submitting}>
                            {submitting ? 'Submitting...' : 'Post review'}
                        </button>
                    </form>
                )}

                {movie.reviews?.length > 0 ? (
                    movie.reviews.map(r => (
                        <div key={r._id} className="review">
                            <div className="review-header">
                                <div className="review-author">
                                    <div className="review-avatar">{r.userId?.username?.[0]?.toUpperCase() || '?'}</div>
                                    <div className="review-name">{r.userId?.username || 'Anonymous'}</div>
                                </div>
                                <div className="review-rating">★ {r.rating}/10</div>
                            </div>
                            <p className="review-text">{r.text}</p>
                        </div>
                    ))
                ) : (
                    <p className="empty-state">No reviews yet. Be the first to share your thoughts.</p>
                )}
            </div>
        </div>
    );
}