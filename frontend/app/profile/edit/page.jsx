'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const ALL_GENRES = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Thriller',
    'Romance', 'Sci-Fi', 'Fantasy', 'Documentary', 'Animation',
    'Crime', 'Mystery', 'Biography', 'History', 'Music'
];

export default function EditProfilePage() {
    const [form, setForm] = useState({ username: '', bio: '', avatar: '', favoriteGenres: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }

        fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const u = data.user;
                setForm({
                    username: u.username || '',
                    bio: u.bio || '',
                    avatar: u.avatar || '',
                    favoriteGenres: u.favoriteGenres || []
                });
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const toggleGenre = (genre) => {
        setForm(prev => ({
            ...prev,
            favoriteGenres: prev.favoriteGenres.includes(genre)
                ? prev.favoriteGenres.filter(g => g !== genre)
                : [...prev.favoriteGenres, genre]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess(false);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`${API_URL}/api/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    username: form.username,
                    bio: form.bio,
                    favoriteGenres: form.favoriteGenres
                })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message || 'Failed to save'); return; }

            if (form.avatar !== '') {
                await fetch(`${API_URL}/api/users/me/avatar`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ avatar: form.avatar })
                });
            }

            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, username: form.username }));
            window.dispatchEvent(new Event('userChanged'));

            setSuccess(true);
            setTimeout(() => window.location.href = '/profile', 1200);
        } catch {
            setError('Something went wrong');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</p>
    );

    return (
        <div style={{ maxWidth: '560px', margin: '3rem auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
                <a href="/profile" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.2rem' }}>
                    ← Back to profile
                </a>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.03em' }}>Edit profile</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                    Update your personal information
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Avatar preview + URL */}
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                }}>
                    <div style={{
                        width: '72px', height: '72px', borderRadius: '50%',
                        background: 'var(--bg-hover)', border: '1px solid var(--border-strong)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', flexShrink: 0
                    }}>
                        {form.avatar
                            ? <img src={form.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                   onError={e => e.target.style.display = 'none'} />
                            : <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)' }}>
                                {form.username?.[0]?.toUpperCase() || '?'}
                              </span>
                        }
                    </div>
                    <div style={{ flex: 1 }}>
                        <label className="form-label">Avatar URL</label>
                        <input
                            type="url"
                            className="form-input"
                            placeholder="https://example.com/photo.jpg"
                            value={form.avatar}
                            onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))}
                        />
                    </div>
                </div>

                {/* Username */}
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-input"
                        value={form.username}
                        onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                        required
                        minLength={2}
                        maxLength={32}
                    />
                </div>

                {/* Bio */}
                <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                        className="form-input"
                        rows={3}
                        placeholder="Tell something about yourself..."
                        value={form.bio}
                        onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                        maxLength={200}
                        style={{ resize: 'vertical', borderRadius: '10px' }}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', float: 'right', marginTop: '0.3rem' }}>
                        {form.bio.length}/200
                    </span>
                </div>

                {/* Favorite genres */}
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="form-label">Favorite genres</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {ALL_GENRES.map(genre => (
                            <button
                                key={genre}
                                type="button"
                                onClick={() => toggleGenre(genre)}
                                style={{
                                    padding: '0.4rem 0.9rem',
                                    borderRadius: '100px',
                                    fontSize: '0.82rem',
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    border: form.favoriteGenres.includes(genre)
                                        ? '1px solid var(--accent)'
                                        : '1px solid var(--border)',
                                    background: form.favoriteGenres.includes(genre)
                                        ? 'var(--accent-soft)'
                                        : 'var(--bg-card)',
                                    color: form.favoriteGenres.includes(genre)
                                        ? 'var(--accent)'
                                        : 'var(--text-secondary)',
                                    transition: 'all 0.15s',
                                    fontFamily: 'inherit'
                                }}
                            >
                                {genre}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                {error && (
                    <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
                )}
                {success && (
                    <p style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        ✓ Saved! Redirecting...
                    </p>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                        {saving ? 'Saving...' : 'Save changes'}
                    </button>
                    <a href="/profile" className="btn btn-outline">Cancel</a>
                </div>
            </form>
        </div>
    );
}