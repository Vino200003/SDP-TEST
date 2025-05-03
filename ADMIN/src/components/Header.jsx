import '../styles/Header.css';

function Header({ title }) {
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);
  
  return (
    <div className="header">
      <div className="header-left">
        <h1>{title}</h1>
        <p className="date">{formattedDate}</p>
      </div>
      <div className="header-right">
        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <button className="search-button">🔍</button>
        </div>
        <div className="header-icons">
          <button className="icon-button">🔔</button>
          <div className="user-profile">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=ffc107&color=fff" alt="User" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
