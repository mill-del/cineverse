'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || 'Registration failed');
                return;
            }
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = '/';
        } catch {
            setError('Something went wrong');
        }
    };

    return (
        <div className="form-container">
            <h1 className="form-title">Join CineClub</h1>
            <p className="form-subtitle">Start your journey</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        className="form-input"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        minLength={3}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-input"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                    />
                </div>

                {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

                <button type="submit" className="form-submit">Create account</button>
            </form>

            <p className="form-link">
                Already have an account? <a href="/login">Sign in</a>
            </p>
        </div>
    );
}