import { useNavigate } from 'react-router-dom';
import { Camera, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login'; // Force reload to clear state
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="logo">
          <Camera size={28} />
          <span>MiniGram</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontWeight: 500 }}>Hello, {username || 'User'}</span>
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
