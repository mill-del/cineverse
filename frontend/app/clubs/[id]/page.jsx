'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUploadThing } from '../../utils/uploadthing';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ClubPage() {
    const { id } = useParams();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [posts, setPosts] = useState([]);
    const [posting, setPosting] = useState(false);
    const [userId, setUserId] = useState(null);

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

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const { startUpload, isUploading } = useUploadThing("clubCover");

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
    }, [id]);

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

    // Use cover image OR first pinned movie's poster as hero background
    const heroBackground = club?.coverUrl || pinnedMovies[0]?.poster;

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
            const data = await res.json();
            setPosts(prev => [data, ...prev]);
            setNewPost('');
        }
        setPosting(false);
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
            {/* CINEMATIC HERO */}
            <div style={{
                position: 'relative',
                minHeight: '440px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: '2.5rem',
                border: '1px solid var(--border)',
            }}>
                {/* BG — either uploaded cover or collage of pinned movie posters */}
                {pinnedMovies.length > 0 && !club.coverUrl ? (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
                        {pinnedMovies.map((m, i) => (
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

                {/* Gradient overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(5,5,5,0.3) 0%, rgba(5,5,5,0.6) 50%, rgba(5,5,5,0.98) 100%)'
                }} />

                {/* Top right actions */}
                <div style={{
                    position: 'absolute', top: '1.5rem', right: '1.5rem',
                    display: 'flex', gap: '0.6rem', zIndex: 2
                }}>
                    {isOwner ? (
                        <>
                            <button className="btn btn-outline" onClick={openEdit}
                                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
                                Edit
                            </button>
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowDeleteConfirm(true)}
                                style={{ color: '#ff8080', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}
                            >
                                Delete
                            </button>
                        </>
                    ) : (
                        <button
                            className={`btn ${isMember ? 'btn-ghost' : 'btn-primary'}`}
                            onClick={handleJoinLeave}
                            disabled={joining}
                            style={isMember ? { background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' } : {}}
                        >
                            {joining ? '...' : isMember ? 'Leave club' : 'Join club'}
                        </button>
                    )}
                </div>

                {/* Hero content */}
                <div style={{
                    position: 'relative', zIndex: 1,
                    padding: '3rem 2.5rem 2.5rem',
                    minHeight: '440px',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }}>
                    {club.theme && (
                        <div style={{
                            display: 'inline-block', alignSelf: 'flex-start',
                            fontSize: '0.7rem',
                            letterSpacing: '0.25em',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                            marginBottom: '1rem',
                            fontWeight: 600,
                            padding: '0.4rem 0.9rem',
                            background: 'rgba(232,197,71,0.1)',
                            border: '1px solid rgba(232,197,71,0.3)',
                            borderRadius: '100px'
                        }}>
                            {club.theme}
                        </div>
                    )}
                    <h1 style={{
                        fontSize: 'clamp(2.2rem, 5vw, 4rem)',
                        fontWeight: 700,
                        letterSpacing: '-0.035em',
                        lineHeight: 1,
                        marginBottom: '1.25rem',
                        textShadow: '0 4px 30px rgba(0,0,0,0.5)'
                    }}>
                        {club.name}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                            {club.members?.length || 0} members
                        </div>
                        {club.creatorId?.username && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                Founded by <strong style={{ color: 'var(--text-secondary)' }}>{club.creatorId.username}</strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PINNED FILMS — featured row */}
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
                            <button
                                onClick={() => setShowMoviePicker(true)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.85rem' }}
                            >
                                + Add film ({pinnedMovies.length}/3)
                            </button>
                        )}
                    </div>

                    {pinnedMovies.length === 0 ? (
                        <div style={{
                            padding: '3rem',
                            background: 'var(--bg-card)',
                            border: '1px dashed var(--border)',
                            borderRadius: 'var(--radius)',
                            textAlign: 'center',
                            color: 'var(--text-muted)'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎞</div>
                            <p style={{ marginBottom: 0 }}>No films featured yet. {isOwner && 'Pin up to 3 films that define this club.'}</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${pinnedMovies.length}, 1fr)`,
                            gap: '1rem'
                        }}>
                            {pinnedMovies.map(m => (
                                <div key={m._id} style={{ position: 'relative', borderRadius: 'var(--radius)', overflow: 'hidden', aspectRatio: '2/3', group: 'card' }}>
                                    <a href={`/movies/${m._id}`}
                                       style={{ display: 'block', height: '100%', textDecoration: 'none', color: 'inherit', position: 'relative' }}>
                                        {m.poster ? (
                                            <img src={m.poster} alt={m.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', background: 'var(--bg-card)' }} />
                                        )}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.95) 100%)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'flex-end',
                                            padding: '1.25rem'
                                        }}>
                                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem', lineHeight: 1.2 }}>{m.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.year}</div>
                                        </div>
                                    </a>
                                    {isOwner && (
                                        <button
                                            onClick={() => handleRemovePinnedMovie(m._id)}
                                            style={{
                                                position: 'absolute', top: '0.6rem', right: '0.6rem',
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'white', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.8rem'
                                            }}
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* DESCRIPTION */}
            {club.description && (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderLeft: '3px solid var(--accent)',
                    borderRadius: 'var(--radius)',
                    padding: '1.5rem 1.75rem',
                    marginBottom: '3rem',
                }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7, margin: 0, fontFamily: 'Instrument Serif, serif', fontStyle: 'italic' }}>
                        "{club.description}"
                    </p>
                </div>
            )}

            {/* DISCUSSIONS + MEMBERS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '3rem' }}>
                <div>
                    <div className="section-header">
                        <div>
                            <div className="section-eyebrow">Community</div>
                            <h2 className="section-title" style={{ fontSize: '1.6rem' }}>Discussions</h2>
                        </div>
                    </div>

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
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <p className="review-text">{post.text}</p>
                            </div>
                        ))
                    )}
                </div>

                <div>
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
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, padding: '1rem'
                }} onClick={() => setShowEdit(false)}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '2rem',
                        width: '100%', maxWidth: '500px'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Edit club</h2>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <label className="form-label">Cover image <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional — pinned films will be used if empty)</span></label>
                            <label style={{
                                display: 'block', cursor: 'pointer',
                                borderRadius: '10px', overflow: 'hidden',
                                border: '2px dashed var(--border)',
                                height: '120px',
                                background: editCoverPreview ? `url(${editCoverPreview}) center/cover` : 'var(--bg)',
                                position: 'relative'
                            }}>
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
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, padding: '1rem'
                }} onClick={() => setShowDeleteConfirm(false)}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '2rem',
                        width: '100%', maxWidth: '420px', textAlign: 'center'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎬</div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>Close this club?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                            This will permanently delete <strong>{club.name}</strong> and all its discussions. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                            <button
                                className="btn"
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{ background: '#e53e3e', color: 'white', border: 'none' }}
                            >
                                {deleting ? 'Deleting...' : 'Yes, close club'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MOVIE PICKER */}
            {showMoviePicker && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, padding: '1rem'
                }} onClick={() => setShowMoviePicker(false)}>
                    <div style={{
                        background: 'var(--bg-card)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '2rem',
                        width: '100%', maxWidth: '520px', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
                    }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>Pin a film</h2>
                        <input
                            type="text"
                            value={movieSearch}
                            onChange={e => setMovieSearch(e.target.value)}
                            placeholder="Search films..."
                            className="form-input"
                            style={{ marginBottom: '1rem' }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
                            {movieResults.map(m => (
                                <button
                                    key={m._id}
                                    onClick={() => handleAddPinnedMovie(m._id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        padding: '0.5rem', background: 'var(--bg)',
                                        border: '1px solid var(--border)', borderRadius: '8px',
                                        cursor: 'pointer', textAlign: 'left', color: 'inherit'
                                    }}
                                >
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