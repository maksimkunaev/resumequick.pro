import React, { useState, useEffect } from "react";
import { API_CONFIG } from "../../api/config";
import styles from "./Footer.module.css"

const Footer = ({ legalConfig }) => {
  const { baseUrl } = API_CONFIG;
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.linkContainer}>
          <a
            href={`${baseUrl}${API_CONFIG.endpoints.privacy}`}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          <a
            href={`${baseUrl}${API_CONFIG.endpoints.terms}`}
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>

        </div>
        <div className={styles.copyright}>
          © {new Date().getFullYear()} {legalConfig?.company_name}
        </div>
      </div>
    </footer>
  );
};

export default Footer;