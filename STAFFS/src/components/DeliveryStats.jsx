import React from 'react';

const DeliveryStats = ({ stats }) => {
  const styles = {
    statsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '1rem',
      marginTop: '1rem'
    },
    statsCard: {
      flex: 1,
      minWidth: '200px',
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.25rem',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      alignItems: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    statsIcon: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      color: '#2196f3',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: '1rem',
      fontSize: '1.5rem'
    },
    assignedIcon: {
      backgroundColor: 'rgba(230, 126, 0, 0.1)',
      color: '#e67e00'
    },
    inTransitIcon: {
      backgroundColor: 'rgba(13, 110, 253, 0.1)',
      color: '#0d6efd'
    },
    completedIcon: {
      backgroundColor: 'rgba(25, 135, 84, 0.1)',
      color: '#198754'
    },
    statsInfo: {
      flex: 1
    },
    statsTitle: {
      fontSize: '0.9rem',
      color: '#666',
      margin: 0,
      marginBottom: '0.5rem'
    },
    statsValue: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#333',
      margin: 0
    }
  };

  return (
    <div style={styles.statsContainer}>
      <div style={styles.statsCard}>
        <div style={styles.statsIcon}>
          <i className="fas fa-motorcycle"></i>
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>Total Deliveries</h3>
          <p style={styles.statsValue}>{stats.total || 0}</p>
        </div>
      </div>
      
      <div style={styles.statsCard}>
        <div style={{...styles.statsIcon, ...styles.assignedIcon}}>
          <i className="fas fa-clipboard-check"></i>
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>Assigned</h3>
          <p style={styles.statsValue}>{stats.assigned || 0}</p>
        </div>
      </div>
      
      <div style={styles.statsCard}>
        <div style={{...styles.statsIcon, ...styles.inTransitIcon}}>
          <i className="fas fa-route"></i>
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>In Transit</h3>
          <p style={styles.statsValue}>{stats.inTransit || 0}</p>
        </div>
      </div>
      
      <div style={styles.statsCard}>
        <div style={{...styles.statsIcon, ...styles.completedIcon}}>
          <i className="fas fa-check-circle"></i>
        </div>
        <div style={styles.statsInfo}>
          <h3 style={styles.statsTitle}>Delivered</h3>
          <p style={styles.statsValue}>{stats.delivered || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryStats;
