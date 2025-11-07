import styles from "../App.module.css";
import { API_CONFIG } from "../api/config";

function LegalNotice({ onClose }) {
  const { baseUrl } = API_CONFIG;
  return (
    <div className={styles.legalNotice}>
      <span>
        📜 By continuing, you agree to AI-based processing and our {' '}
        <a
          href={`${baseUrl}${API_CONFIG.endpoints.terms}`}
          style={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </a>
        {' '} &{' '}
        <a
          href={`${baseUrl}${API_CONFIG.endpoints.privacy}`}
          style={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </a>.
      </span>
      <button onClick={onClose}>Got it</button>{" "}
    </div>
  );
}
export default LegalNotice;
