'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ClubPage() {
    const { id } = useParams();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [newPost, setNewPost] = useState('');
    const [posts, setPosts] = useState([]);
    const [posting, setPosting] = useState(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

    useEffect(() => {
        fetch(`${API_URL}/api/clubs/${id}`)
            .then(r => r.json())
            .then(data => { setClub(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [id]);

    const isMember = club?.members?.some(m => m === user?._id || m?._id === user?._id);

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

    if (loading) return <p className="loading-state">Loading...</p>;
    if (!club) return <p className="loading-state">Club not found</p>;

    return (
        <div>
            {/* HEADER */}
            <div style={{
                height: '220px',
                background: club.coverUrl
                    ? `linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,0.8) 100%), url(${club.coverUrl}) center/cover`
                    : 'linear-gradient(135deg, #1a1a1a, #111)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '2rem',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '2rem',
                border: '1px solid var(--border)'
            }}>
                <div style={{ flex: 1 }}>
                    {club.theme && <div className="club-theme">{club.theme}</div>}
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                        {club.name}
                    </h1>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {club.members?.length || 0} members
                    </div>
                </div>
                <button
                    className={`btn ${isMember ? 'btn-ghost' : 'btn-primary'}`}
                    onClick={handleJoinLeave}
                    disabled={joining}
                >
                    {joining ? '...' : isMember ? 'Leave club' : 'Join club'}
                </button>
            </div>

            {club.description && (
                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1rem', lineHeight: 1.7 }}>
                    {club.description}
                </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '3rem' }}>
                {/* POSTS */}
                <div>
                    <div className="section-header">
                        <div>
                            <div className="section-eyebrow">Community</div>
                            <h2 className="section-title" style={{ fontSize: '1.8rem' }}>Discussions</h2>
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
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem' }}>
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
        </div>
    );
}