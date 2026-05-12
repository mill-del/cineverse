'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const syncUser = () => {
            const stored = localStorage.getItem('user');
            setUser(stored ? JSON.parse(stored) : null);
        };

        syncUser(); // читаем при монтировании

        // слушаем кастомное событие при логине
        window.addEventListener('userChanged', syncUser);
        // слушаем storage (если логин в другой вкладке)
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
            <a href="/" className="navbar-logo"> {/* ← было /frontend/public */}
                <span className="logo-icon"></span> CINECLUB
            </a>
            <div className="navbar-links">
                <a href="/">Movies</a> {/* ← было /frontend/public */}
                <a href="/clubs">Clubs</a>
                <a href="/vote">Vote</a>
                {user ? (
                    <>
                        <a href="/profile">{user.username}</a>
                        <button
                            onClick={handleLogout}
                            className="btn-logout">

                            Logout
                        </button>
                    </>
                ) : (
                    <a href="/login" className="btn-login">Sign in</a>
                )}
            </div>
        </nav>
    );
}