import React from "react";
import styles from "./CookieConsent.module.css";

const CookieConsent = ({ onAccept, onReject }) => {
  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "true");
    onAccept();
  };

  const handleReject = () => {
    localStorage.setItem("cookieConsent", "false");
    onReject();
  };

  return (
    <div className={styles.cookieConsent}>
      <div className={styles.content}>
        <p className={styles.message}>
          We use analytics cookies to improve our site. Accept or reject these
          optional cookies
        </p>
        <div className={styles.buttonContainer}>
          <button onClick={handleReject} className={styles.rejectButton}>
            Reject
          </button>
          <button onClick={handleAccept} className={styles.acceptButton}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
