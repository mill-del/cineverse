'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useUploadThing } from '../../utils/uploadthing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const WS_BASE = API_URL.replace('http', 'ws');

export default function ClubPage() {
    const { id } = useParams();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [userId, setUserId] = useState(null);

    // Posts (discussions)
    const [newPost, setNewPost] = useState('');
    const [posts, setPosts] = useState([]);
    const [posting, setPosting] = useState(false);

    // Live chat
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    // Online users
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Edit/Delete/Movie picker
    const [showEdit, setShowEdit] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editTheme, setEditTheme] = useState('');
    const [editCoverUrl, setEditCoverUrl] = useState('');
    const [editCoverPreview, setEditCoverPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showMoviePicker, setShowMoviePicker] = useState(false);
    const [movieSearch, setMovieSearch] = useState('');
    const [movieResults, setMovieResults] = useState([]);

    // Tab: discussions or chat
    const [activeTab, setActiveTab] = useState('discussions');

    const wsRef = useRef(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { startUpload, isUploading } = useUploadThing("clubCover");

    // Initial load
    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/api/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(r => r.json())
                .then(data => setUserId(data.user?._id || data._id))
                .catch(() => {});
        }

        fetch(`${API_URL}/api/clubs/${id}`)
            .then(r => r.json())
            .then(data => { setClub(data); setLoading(false); })
            .catch(() => setLoading(false));

        fetch(`${API_URL}/api/posts/club/${id}`)
            .then(r => r.json())
            .then(data => setPosts(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [id]);

    // WebSocket connection
    useEffect(() => {
        if (!token || !id) return;

        const ws = new WebSocket(`${WS_BASE}/ws/clubs/${id}?token=${token}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.type === 'online_users') {
                    setOnlineUsers(msg.users || []);
                }
                if (msg.type === 'new_post') {
                    setPosts(prev => {
                        if (prev.some(p => p._id === msg.post._id)) return prev;
                        return [msg.post, ...prev];
                    });
                }
                if (msg.type === 'delete_post') {
                    setPosts(prev => prev.filter(p => p._id !== msg.postId));
                }
                if (msg.type === 'chat') {
                    setChatMessages(prev => [...prev, msg]);
                }
            } catch {}
        };

        return () => ws.close();
    }, [id, token]);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const isMember = userId && club?.members?.some(
        m => (typeof m === 'string' ? m : m?._id) === userId
    );
    const isOwner = userId && (
        typeof club?.creatorId === 'string'
            ? club.creatorId === userId
            : club?.creatorId?._id === userId
    );

    const pinnedMovies = club?.pinnedMovies || [];
    const canAddMore = pinnedMovies.length < 3;
    const heroBackground = club?.coverUrl || pinnedMovies[0]?.poster;

    // --- handlers ---
    const openEdit = () => {
        setEditName(club.name || '');
        setEditDescription(club.description || '');
        setEditTheme(club.theme || '');
        setEditCoverUrl(club.coverUrl || '');
        setEditCoverPreview(club.coverUrl || '');
        setShowEdit(true);
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const res = await startUpload([file]);
        if (res?.[0]?.url) {
            setEditCoverUrl(res[0].url);
            setEditCoverPreview(res[0].url);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const res = await fetch(`${API_URL}/api/clubs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: editName, description: editDescription, theme: editTheme, coverUrl: editCoverUrl })
        });
        if (res.ok) {
            const data = await res.json();
            setClub(data);
            setShowEdit(false);
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        setDeleting(true);
        const res = await fetch(`${API_URL}/api/clubs/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) window.location.href = '/clubs';
        setDeleting(false);
    };

    const handleJoinLeave = async () => {
        if (!token) { window.location.href = '/login'; return; }
        setJoining(true);
        const endpoint = isMember ? 'leave' : 'join';
        const res = await fetch(`${API_URL}/api/clubs/${id}/${endpoint}`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setClub(data.club);
        } else {
            const err = await res.json();
            alert(err.message || 'Action failed');
        }
        setJoining(false);
    };

    const handlePost = async (e) => {
        e.preventDefault();
        if (!token || !newPost.trim()) return;
        setPosting(true);
        const res = await fetch(`${API_URL}/api/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ clubId: id, text: newPost })
        });
        if (res.ok) {
            setNewPost('');
            // Post появится через WebSocket
        }
        setPosting(false);
    };

    const handleDeletePost = async (postId) => {
        const res = await fetch(`${API_URL}/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        // Удаление придёт через WebSocket
    };

    const handleSendChat = (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: 'chat', text: chatInput }));
        setChatInput('');
    };

    useEffect(() => {
        if (!showMoviePicker || !movieSearch.trim()) { setMovieResults([]); return; }
        const t = setTimeout(() => {
            fetch(`${API_URL}/api/movies?search=${encodeURIComponent(movieSearch)}`)
                .then(r => r.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : data.movies || [];
                    setMovieResults(list.slice(0, 8));
                })
                .catch(() => {});
        }, 300);
        return () => clearTimeout(t);
    }, [movieSearch, showMoviePicker]);

    const handleAddPinnedMovie = async (movieId) => {
        if (pinnedMovies.some(m => m._id === movieId)) {
            setShowMoviePicker(false);
            return;
        }
        const newIds = [...pinnedMovies.map(m => m._id), movieId];
        const res = await fetch(`${API_URL}/api/clubs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pinnedMovies: newIds })
        });
        if (res.ok) {
            const data = await res.json();
            setClub(data);
            setShowMoviePicker(false);
            setMovieSearch('');
        }
    };

    const handleRemovePinnedMovie = async (movieId) => {
        const newIds = pinnedMovies.filter(m => m._id !== movieId).map(m => m._id);
        const res = await fetch(`${API_URL}/api/clubs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ pinnedMovies: newIds })
        });
        if (res.ok) {
            const data = await res.json();
            setClub(data);
        }
    };

    if (loading) return <p className="loading-state">Loading...</p>;
    if (!club) return <p className="loading-state">Club not found</p>;

    return (
        <div>
            {/* HERO */}
            <div style={{
                position: 'relative',
                minHeight: '440px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: '2.5rem',
                border: '1px solid var(--border)',
            }}>
                {pinnedMovies.length > 0 && !club.coverUrl ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                        {pinnedMovies.map((m) => (
                            <div key={m._id} style={{
                                flex: 1,
                                backgroundImage: m.poster ? `url(${m.poster})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'brightness(0.35) saturate(1.2)',
                            }} />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: heroBackground
                            ? `url(${heroBackground}) center/cover`
                            : 'linear-gradient(135deg, #1a1a2e, #16213e)',
                        filter: heroBackground ? 'brightness(0.35) saturate(1.2)' : 'none'
                    }} />
                )}

                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0.98) 100%)'
                }} />

                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '0.6rem', zIndex: 2 }}>
                    {isOwner ? (
                        <>
                            <button className="btn btn-outline" onClick={openEdit}
                                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>Edit</button>
                            <button className="btn btn-ghost" onClick={() => setShowDeleteConfirm(true)}
                                    style={{ color: '#ff8080', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>Delete</button>
                        </>
                    ) : (
                        <button className={`btn ${isMember ? 'btn-ghost' : 'btn-primary'}`}
                                onClick={handleJoinLeave} disabled={joining}
                                style={isMember ? { background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' } : {}}>
                            {joining ? '...' : isMember ? 'Leave club' : 'Join club'}
                        </button>
                    )}
                </div>

                <div style={{
                    position: 'relative', zIndex: 1,
                    padding: '3rem 2.5rem 2.5rem',
                    minHeight: '440px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }}>
                    {club.theme && (
                        <div style={{
                            display: 'inline-block', alignSelf: 'flex-start',
                            fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase',
                            color: 'var(--accent)', marginBottom: '1rem', fontWeight: 600,
                            padding: '0.4rem 0.9rem', background: 'rgba(232,197,71,0.1)',
                            border: '1px solid rgba(232,197,71,0.3)', borderRadius: '100px'
                        }}>
                            {club.theme}
                        </div>
                    )}
                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 700,
                        letterSpacing: '-0.035em', lineHeight: 1, marginBottom: '1.25rem',
                        textShadow: '0 4px 30px rgba(0,0,0,0.5)'
                    }}>{club.name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                            {club.members?.length || 0} members
                        </div>
                        {onlineUsers.length > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                <span className="live-dot"></span>
                                {onlineUsers.length} online now
                            </div>
                        )}
                        {club.creatorId?.username && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Founded by <strong style={{ color: 'var(--text-secondary)' }}>{club.creatorId.username}</strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PINNED FILMS */}
            {(pinnedMovies.length > 0 || isOwner) && (
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <div>
                            <div className="section-eyebrow">Featured</div>
                            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>
                                Films of the <span className="serif" style={{ color: 'var(--accent)', fontStyle: 'italic' }}>club</span>
                            </h2>
                        </div>
                        {isOwner && canAddMore && (
                            <button onClick={() => setShowMoviePicker(true)} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                                + Add film ({pinnedMovies.length}/3)
                            </button>
                        )}
                    </div>

                    {pinnedMovies.length === 0 ? (
                        <div style={{ padding: '3rem', background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎞</div>
                            <p style={{ marginBottom: 0 }}>No films featured yet. {isOwner && 'Pin up to 3 films that define this club.'}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${pinnedMovies.length}, 1fr)`, gap: '1rem' }}>
                            {pinnedMovies.map(m => (
                                <div key={m._id} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '2/3' }}>
                                    <a href={`/movies/${m._id}`} style={{ display: 'block', height: '100%', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
                                        {m.poster ? (
                                            <img src={m.poster} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)' }} />
                                        )}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.95) 100%)',
                                            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.25rem'
                                        }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem', lineHeight: 1.2 }}>{m.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.year}</div>
                                        </div>
                                    </a>
                                    {isOwner && (
                                        <button onClick={() => handleRemovePinnedMovie(m._id)} style={{
                                            position: 'absolute', top: '0.6rem', right: '0.6rem',
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(255,255,255,0.1)', color: 'white',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem'
                                        }}>×</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {club.description && (
                <div style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--accent)', borderRadius: 'var(--radius)',
                    padding: '1.5rem 1.75rem', marginBottom: '3rem',
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, margin: 0, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
                        "{club.description}"
                    </p>
                </div>
            )}

            {/* TABS + CONTENT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '3rem' }}>
                <div>
                    {/* Tab switcher */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        {['discussions', 'chat'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: '0.75rem 1.25rem',
                                background: 'none',
                                border: 'none',
                                borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
                                color: activeTab === tab ? 'var(--text)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                textTransform: 'capitalize',
                                fontFamily: 'inherit',
                                transition: '0.2s'
                            }}>
                                {tab} {tab === 'chat' && onlineUsers.length > 0 && (
                                <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', color: 'var(--accent)' }}>● live</span>
                            )}
                            </button>
                        ))}
                    </div>

                    {/* DISCUSSIONS */}
                    {activeTab === 'discussions' && (
                        <>
                            {isMember && (
                                <form onSubmit={handlePost} style={{ marginBottom: '2rem' }}>
                                    <textarea
                                        value={newPost}
                                        onChange={e => setNewPost(e.target.value)}
                                        className="form-input"
                                        rows={3}
                                        placeholder="Share your thoughts with the club..."
                                        style={{ borderRadius: '12px', resize: 'vertical', marginBottom: '0.75rem' }}
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={posting || !newPost.trim()}>
                                        {posting ? 'Posting...' : 'Post'}
                                    </button>
                                </form>
                            )}

                            {posts.length === 0 ? (
                                <p className="empty-state" style={{ padding: '3rem 0' }}>
                                    No discussions yet. {isMember ? 'Be the first to post!' : 'Join to start a discussion.'}
                                </p>
                            ) : (
                                posts.map(post => (
                                    <div key={post._id} className="review">
                                        <div className="review-header">
                                            <div className="review-author">
                                                <div className="review-avatar">
                                                    {post.authorId?.username?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <div className="review-name">{post.authorId?.username || 'Member'}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {new Date(post.createdAt).toLocaleDateString()}
                                                </div>
                                                {userId && String(post.authorId?._id || post.authorId) === userId && (
                                                    <button onClick={() => handleDeletePost(post._id)} style={{
                                                        background: 'none', border: 'none',
                                                        color: 'var(--text-muted)', cursor: 'pointer',
                                                        fontSize: '0.8rem'
                                                    }}>🗑</button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="review-text">{post.text}</p>
                                    </div>
                                ))
                            )}
                        </>
                    )}

                    {/* LIVE CHAT */}
                    {activeTab === 'chat' && (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            height: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                                    <span className="live-dot"></span>
                                    Live chat
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    Messages aren't saved
                                </div>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {chatMessages.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 'auto', fontSize: '0.85rem' }}>
                                        No messages yet. Say hi! 👋
                                    </p>
                                ) : (
                                    chatMessages.map((msg, i) => {
                                        const isMine = msg.userId === userId;
                                        return (
                                            <div key={i} style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: isMine ? 'flex-end' : 'flex-start',
                                                gap: '0.2rem'
                                            }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0 0.5rem' }}>
                                                    {isMine ? 'You' : msg.username}
                                                </div>
                                                <div style={{
                                                    maxWidth: '70%',
                                                    padding: '0.55rem 0.9rem',
                                                    background: isMine ? 'var(--accent)' : 'var(--bg-hover)',
                                                    color: isMine ? 'var(--bg)' : 'var(--text)',
                                                    borderRadius: '14px',
                                                    fontSize: '0.9rem',
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {isMember ? (
                                <form onSubmit={handleSendChat} style={{
                                    padding: '0.75rem', borderTop: '1px solid var(--border)',
                                    display: 'flex', gap: '0.5rem'
                                }}>
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="form-input"
                                        style={{ flex: 1, marginBottom: 0 }}
                                    />
                                    <button type="submit" className="btn btn-primary" disabled={!chatInput.trim()}>Send</button>
                                </form>
                            ) : (
                                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                    Join the club to chat
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* SIDEBAR */}
                <div>
                    {/* ONLINE NOW */}
                    {onlineUsers.length > 0 && (
                        <div style={{
                            background: 'var(--bg-card)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                <span className="live-dot"></span>
                                <div className="section-eyebrow" style={{ margin: 0 }}>Online now</div>
                            </div>
                            {onlineUsers.map(u => (
                                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.6rem' }}>
                                    <div style={{ position: 'relative' }}>
                                        <div className="review-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                                            {u.username?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div style={{
                                            position: 'absolute', bottom: -1, right: -1,
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: '#4ade80', border: '2px solid var(--bg-card)'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {u.username} {u._id === userId && '(you)'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* MEMBERS */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem' }}>
                        <div className="section-eyebrow" style={{ marginBottom: '1rem' }}>Members</div>
                        {club.members?.slice(0, 8).map((m, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.75rem' }}>
                                <div className="review-avatar" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                    {(m?.username || m)?.[0]?.toUpperCase() || '?'}
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {m?.username || 'Member'}
                                </span>
                            </div>
                        ))}
                        {(club.members?.length || 0) > 8 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                +{club.members.length - 8} more
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            {showEdit && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={() => setShowEdit(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit club</h2>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label">Cover image</label>
                            <label style={{ display: 'block', cursor: 'pointer', borderRadius: '10px', overflow: 'hidden', border: '2px dashed var(--border)', height: '120px', background: editCoverPreview ? `url(${editCoverPreview}) center/cover` : 'var(--bg)', position: 'relative' }}>
                                <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                                {!editCoverPreview && (
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {isUploading ? 'Uploading...' : 'Click to upload'}
                                    </div>
                                )}
                            </label>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Club name</label>
                            <input className="form-input" value={editName} onChange={e => setEditName(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label className="form-label">Theme</label>
                            <input className="form-input" value={editTheme} onChange={e => setEditTheme(e.target.value)} />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="form-label">Description</label>
                            <textarea className="form-input" value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving || isUploading}>
                                {saving ? 'Saving...' : 'Save changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM */}
            {showDeleteConfirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={() => setShowDeleteConfirm(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '420px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎬</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>Close this club?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                            This will permanently delete <strong>{club.name}</strong> and all its discussions.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button className="btn" onClick={handleDelete} disabled={deleting} style={{ background: '#e53e3e', color: 'white', border: 'none' }}>
                                {deleting ? 'Deleting...' : 'Yes, close club'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MOVIE PICKER */}
            {showMoviePicker && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }} onClick={() => setShowMoviePicker(false)}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>Pin a film</h2>
                        <input type="text" value={movieSearch} onChange={e => setMovieSearch(e.target.value)} placeholder="Search films..." className="form-input" style={{ marginBottom: '1rem' }} autoFocus />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
                            {movieResults.map(m => (
                                <button key={m._id} onClick={() => handleAddPinnedMovie(m._id)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', color: 'inherit' }}>
                                    {m.poster && <img src={m.poster} alt="" style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.year}</div>
                                    </div>
                                </button>
                            ))}
                            {movieSearch && movieResults.length === 0 && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>No films found</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}