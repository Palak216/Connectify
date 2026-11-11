
import { useNavigate } from 'react-router-dom';
import { Camera, LogOut } from 'lucide-react';
import { API_URL } from '../config';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

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
          <span>MiniGram</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontWeight: 500 }}>
            Hello, {username || 'User'}
          </span>

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
