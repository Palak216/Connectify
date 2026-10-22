import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { API_URL, API_BASE_URL, getAuthHeaders } from '../config';
import CreatePost from '../components/CreatePost';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [feedMode, setFeedMode] = useState('everyone');
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentTexts, setCommentTexts] = useState({});

  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  })();

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/posts${feedMode === 'following' ? '?feed=following' : ''}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      } else if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [feedMode]);

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setPosts(posts.map(post => {
          if (post._id === postId) {
            const hasLiked = post.likes.includes(currentUserId);
            return {
              ...post,
              likes: hasLiked 
                ? post.likes.filter(id => id !== currentUserId)
                : [...post.likes, currentUserId]
            };
          }
          return post;
        }));
      }
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        setPosts(posts.filter(p => p._id !== postId));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const toggleComments = (postId) => {
    setExpandedComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const text = commentTexts[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const data = await res.json();
        // Optimistic update
        setPosts(posts.map(post => {
          if (post._id === postId) {
            // Attach current username since backend might only return author ID initially
            // But actually backend doesn't populate author inside the addComment response, 
            // so we inject the current username for instant display
            const newComment = {
              ...data.comment,
              author: { username: localStorage.getItem('username') }
            };
            return { ...post, comments: [...post.comments, newComment] };
          }
          return post;
        }));
        // Clear input
        setCommentTexts(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div className="feed-layout">
        <div className="main-feed">
          <CreatePost onPostCreated={fetchPosts} />
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }} role="group" aria-label="Choose feed">
            <button className={feedMode === 'everyone' ? 'btn btn-primary' : 'btn'} onClick={() => setFeedMode('everyone')}>Everyone</button>
            <button className={feedMode === 'following' ? 'btn btn-primary' : 'btn'} onClick={() => setFeedMode('following')}>Following</button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <h2>No posts yet!</h2>
              <p>Be the first to share something.</p>
            </div>
          ) : (
            posts.map((post) => {
              const hasLiked = post.likes.includes(currentUserId);
              const isOwner = post.author?._id === currentUserId;
              const isCommentsOpen = expandedComments[post._id];
              
              return (
                <div key={post._id} className="post-card glass-panel animate-fade-in">
                  <div className="post-header">
                    <div className="post-user">
                      <div className="avatar">
                        {post.author?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span>{post.author?.username || 'Unknown User'}</span>
                    </div>
                    {isOwner && (
                      <button 
                        className="action-btn" 
                        style={{ color: 'var(--error)' }}
                        onClick={() => handleDelete(post._id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  {post.imageUrl && (
                    <img 
                      src={post.imageUrl.startsWith('http') ? post.imageUrl : `${API_BASE_URL}/${post.imageUrl.replace('\\', '/')}`} 
                      alt="Post" 
                      className="post-image" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  
                  <div className="post-actions">
                    <button 
                      className="action-btn" 
                      style={{ color: hasLiked ? 'var(--error)' : 'var(--text-primary)' }}
                      onClick={() => handleLike(post._id)}
                    >
                      <Heart size={24} fill={hasLiked ? 'currentColor' : 'none'} />
                      <span>{post.likes?.length || 0}</span>
                    </button>
                    <button 
                      className="action-btn"
                      onClick={() => toggleComments(post._id)}
                    >
                      <MessageCircle size={24} />
                      <span>{post.comments?.length || 0} Comments</span>
                    </button>
                  </div>
                  
                  <div className="post-content">
                    {post.content && (
                      <p>
                        <span style={{ fontWeight: 600, marginRight: '8px' }}>
                          {post.author?.username}
                        </span>
                        {post.content}
                      </p>
                    )}
                    <span className="post-date">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Comment Section */}
                  {isCommentsOpen && (
                    <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px' }}>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
                        {post.comments && post.comments.length > 0 ? (
                          post.comments.map(comment => (
                            <div key={comment._id} style={{ marginBottom: '8px', fontSize: '0.9rem' }}>
                              <span style={{ fontWeight: 600, marginRight: '8px' }}>
                                {comment.author?.username || 'User'}
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>{comment.text}</span>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No comments yet.</div>
                        )}
                      </div>
                      
                      <form onSubmit={(e) => handleCommentSubmit(e, post._id)} style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="form-input"
                          style={{ padding: '8px 12px', fontSize: '0.9rem' }}
                          value={commentTexts[post._id] || ''}
                          onChange={(e) => setCommentTexts(prev => ({ ...prev, [post._id]: e.target.value }))}
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
                          <Send size={16} />
                        </button>
                      </form>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        <div className="sidebar" style={{ display: 'none' }}>
          <div className="glass-panel" style={{ padding: '20px', position: 'sticky', top: '90px' }}>
            <h3 style={{ marginBottom: '15px' }}>Suggested for you</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Follow people to see their posts.</p>
          </div>
        </div>
        <style>{`
          @media (min-width: 768px) {
            .sidebar { display: block !important; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Feed;
