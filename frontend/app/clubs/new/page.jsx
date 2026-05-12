'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function NewClubPage() {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [theme, setTheme] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        setLoading(true);
        setError('');
        const res = await fetch(`${API_URL}/api/clubs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name, description, theme })
        });
        const data = await res.json();
        if (res.ok) {
            window.location.href = `/clubs/${data.club._id}`;
        } else {
            setError(data.message || 'Failed to create club');
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '560px', margin: '0 auto', paddingTop: '2rem' }}>
            <a href="/clubs" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '2rem' }}>
                ← Back to clubs
            </a>

            <div style={{ marginBottom: '2.5rem' }}>
                <div className="section-eyebrow">New</div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Create a club</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                    <label className="form-label">Club name *</label>
                    <input
                        type="text"
                        className="form-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Kubrick Lovers"
                        required
                        minLength={3}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Theme</label>
                    <input
                        type="text"
                        className="form-input"
                        value={theme}
                        onChange={e => setTheme(e.target.value)}
                        placeholder="e.g. 80s Horror, French New Wave, Anime"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-input"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="What is this club about?"
                        rows={4}
                        style={{ resize: 'vertical' }}
                    />
                </div>

                {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem' }}>{error}</p>}

                <button type="submit" className="btn btn-primary" style={{ borderRadius: '10px', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 600 }} disabled={loading}>
                    {loading ? 'Creating...' : 'Create club'}
                </button>
            </form>
        </div>
    );
}