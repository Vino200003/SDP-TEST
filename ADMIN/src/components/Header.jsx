import '../styles/Header.css';

function Header({ title }) {
  return (
    <div className="header">
      <div className="header-content">
        <h1>{title}</h1>
        <div className="header-right">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <button type="submit">🔍</button>
          </div>
          <div className="user-profile">
            <span className="notifications">🔔</span>
            <div className="profile-image">👤</div>
            <span className="admin-name">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
