import React from 'react';
import styles from './MaintenanceIcon.module.css';

function MaintenanceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${styles.errorIcon} ${styles.maintenanceIcon}`}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12" y2="16" />
    </svg>
  );
}

function MaintenanceComponent({ onRetry, isRetrying }) {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorCard}>
        <MaintenanceIcon />
        <h2 className={styles.errorTitle}>System Maintenance</h2>
        <p className={styles.errorMessage}>
          We're currently working on improving our services. Our team is actively
          addressing the issue, and we expect to be back online shortly. Thank you
          for your patience.
        </p>
      </div>
    </div>
  );
}

export default MaintenanceComponent;