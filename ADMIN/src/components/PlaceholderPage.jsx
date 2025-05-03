import Header from './Header';
import Sidebar from './Sidebar';

function PlaceholderPage({ title }) {
  return (
    <div className="page-container">
      <Sidebar />
      <main className="page-content">
        <Header title={title} />
        <div className="placeholder-content">
          <div className="placeholder-card">
            <h2>{title} Page</h2>
            <p>This page is under construction.</p>
            <div className="construction-icon">🚧</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PlaceholderPage;
