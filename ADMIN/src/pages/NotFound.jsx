import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="not-found-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '8rem', margin: '0', color: '#343a40' }}>404</h1>
      <h2 style={{ fontSize: '2rem', margin: '1rem 0', color: '#495057' }}>Page Not Found</h2>
      <p style={{ fontSize: '1.2rem', color: '#6c757d', maxWidth: '500px', margin: '1rem 0 2rem' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" style={{
        backgroundColor: '#ffc107',
        color: '#212529',
        padding: '0.75rem 1.5rem',
        borderRadius: '5px',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: 'background-color 0.3s'
      }}>
        Return to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
