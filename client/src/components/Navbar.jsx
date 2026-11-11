import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut, Bell, Check } from 'lucide-react';
import { API_URL } from '../config';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const [showNotifications, setShowNotifications] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket() || {};

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      navigate('/login', { replace: true });
    }
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="logo">
          <Camera size={28} />
          <span>Connectify</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative' }}>
          <span style={{ fontWeight: 500 }}>
            Hello, {username || 'User'}
          </span>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              className="action-btn"
              onClick={() => setShowNotifications((prev) => !prev)}
              title="Notifications"
              style={{ position: 'relative' }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--error, #ef4444)',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 700,
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                className="glass-panel animate-fade-in"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  width: '320px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  background: 'rgba(23, 23, 23, 0.95)',
                  border: '1px solid var(--border-color, #333)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
                  zIndex: 100,
                  padding: '12px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid var(--border-color, #333)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary, #6366f1)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>

                {notifications && notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => !notif.read && markAsRead(notif._id)}
                      style={{
                        padding: '8px 10px',
                        marginBottom: '6px',
                        borderRadius: '6px',
                        cursor: notif.read ? 'default' : 'pointer',
                        background: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.12)',
                        borderLeft: notif.read ? 'none' : '3px solid var(--accent-primary, #6366f1)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <div>
                        <strong>{notif.actor?.username || 'Someone'}</strong>{' '}
                        {notif.type === 'like' && 'liked your post.'}
                        {notif.type === 'comment' && 'commented on your post.'}
                        {notif.type === 'follow' && 'started following you.'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #888)', marginTop: '2px' }}>
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted, #888)', fontSize: '0.9rem' }}>
                    No notifications yet
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="action-btn"
            style={{ color: 'var(--error)' }}
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
