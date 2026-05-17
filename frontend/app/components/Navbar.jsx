'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const syncUser = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };
        syncUser();
        window.addEventListener('userChanged', syncUser);
        window.addEventListener('storage', syncUser);
        return () => {
            window.removeEventListener('userChanged', syncUser);
            window.removeEventListener('storage', syncUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/';
    };

    return (
        <nav className="navbar">
            <a href="/" className="navbar-logo">
                <span className="logo-icon"></span> CINECLUB
            </a>

            {/* Гамбургер кнопка */}
            <button
                className="navbar-burger"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <div className={`navbar-links ${menuOpen ? 'navbar-links--open' : ''}`}>
                <a href="/" onClick={() => setMenuOpen(false)}>Movies</a>
                <a href="/clubs" onClick={() => setMenuOpen(false)}>Clubs</a>
                <a href="/vote" onClick={() => setMenuOpen(false)}>Vote</a>
                {user ? (
                    <>
                        <a href="/profile" onClick={() => setMenuOpen(false)}>{user.username}</a>
                        <button onClick={handleLogout} className="btn-logout">Logout</button>
                    </>
                ) : (
                    <a href="/login" className="btn-login" onClick={() => setMenuOpen(false)}>Sign in</a>
                )}
            </div>
        </nav>
    );
}