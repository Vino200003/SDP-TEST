import '../styles/StatCard.css';

function StatCard({ title, value, icon, color }) {
  // Use the custom color or fall back to primary color from theme
  const iconColor = color || 'var(--primary-color)';
  
  return (
    <div className="stat-card" style={{ borderLeft: `4px solid ${iconColor}` }}>
      <div className="stat-icon" style={{ backgroundColor: `${iconColor}20`, color: iconColor }}>
        {icon}
      </div>
      <div className="stat-details">
        <h3>{title}</h3>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
