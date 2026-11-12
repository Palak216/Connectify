import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Feed from './pages/Feed';
import Navbar from './components/Navbar';
import { SocketProvider } from './context/SocketContext';

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <SocketProvider>
      <Router>
        <div className="app">
          {isAuthenticated && <Navbar />}
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Auth /> : <Navigate to="/" />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <Feed /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
