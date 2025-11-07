import React, { useEffect, useState, useRef } from "react";
// import PricingPage from "./components/PricingPage";
import ResumeFormBlock from "./components/ResumeFormBlock";
import ResumePreviewBlock from "./components/ResumePreviewBlock";
import ATSScore from "./components/ATSScore";
import LegalNotice from "./components/LegalNotice";
import Modal from "./components/Modal";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header";
import Button from "./components/Button"; // NEW IMPORT
import CookieConsent from "./components/CookieConsent/CookieConsent"; // NEW IMPORT

import { downloadPDF } from "./api/pdfService";
import { initialFormData } from './api/constants'

import { generateResume } from "./api/generateResume";
import { generateGuestResume } from "./api/generateGuestResume";
import useUser from "./hooks/useUser";
import { signInWithGoogle, signOutUser } from "./lib/firebaseAuthService";
import styles from "./App.module.css";
import { showError } from "./utils/erroMessage";

function App() {
  const { user, credits, loading, refetch } = useUser();

  const [resumeData, setResumeData] = useState("");
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState("generate");

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  // REMOVED: const [showPricing, setShowPricing] = useState(false);
  const [legalNoticeVisible, setLegalNoticeVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // NEW STATE FOR COOKIE CONSENT
  const [showCookieConsent, setShowCookieConsent] = useState(false);


  // NEW FUNCTION TO CHECK COOKIE CONSENT
  const checkCookieConsent = () => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent === null) { // No decision made yet
      setShowCookieConsent(true);
    }
  };

  // NEW HANDLERS FOR COOKIE CONSENT
  const handleCookieAccept = () => {
    setShowCookieConsent(false);
    localStorage.setItem("cookieConsent", "accepted");
    // Here you can initialize analytics/tracking if needed
  };

  const handleCookieReject = () => {
    setShowCookieConsent(false);
    localStorage.setItem("cookieConsent", "rejected");
    // Here you can disable analytics/tracking
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { resumeData: formData };
    setIsGenerating(true);

    try {
      let data;

      if (user) {
        // No credit limits - always allow generation
        data = await generateResume({ resumeData: payload.resumeData, user });
        refetch(); // Refresh credits after generation
      } else {
        // Guest logic remains the same
        const used = parseInt(localStorage.getItem("guest_used") || "0", 10);
        if (used >= 2) {
          setLoginModalOpen(true);
          return;
        }

        data = await generateGuestResume({ resumeData: payload.resumeData });
        localStorage.setItem("guest_used", used + 1);
      }

      setResumeData(data.result?.resumeData || JSON.stringify(data));
    } catch (error) {
      const errorMessage = "Ошибка генерации: " + error.message;
      setResumeData(errorMessage);
      showError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const previewRef = useRef();

  const handleDownload = async () => {
    if (!previewRef.current) return;
    const html = previewRef.current.innerHTML;
    await downloadPDF(html);
  };

  const onHideLehalNotice = () => {
    localStorage.setItem('legal_notice_agreed', true);
    setLegalNoticeVisible(false);
  };

  const checkLegalNoticeVisibility = () => {
    const agreed = localStorage.getItem('legal_notice_agreed');
    if (agreed !== 'true') {
      setLegalNoticeVisible(true);
    }
  };

  useEffect(() => {
    checkLegalNoticeVisibility();
    checkCookieConsent(); // NEW: Check cookie consent on mount
  }, []);

  return (
    <div className={styles.appContainer}>
      <Header
        user={user}
        credits={credits}
        loading={loading}
        signIn={signInWithGoogle}
        signOut={signOutUser}
      // Pricing functionality removed
      />

      {/* COOKIE CONSENT - SHOWS BEFORE LEGAL NOTICE */}
      {showCookieConsent && (
        <CookieConsent
          onAccept={handleCookieAccept}
          onReject={handleCookieReject}
        />
      )}

      {legalNoticeVisible && (
        <LegalNotice onClose={onHideLehalNotice} />
      )}


      {/* UPDATED TAB NAVIGATION WITH BUTTON COMPONENT */}
      <div className={styles.tabContainer}>
        <Button
          variant="tab"
          active={activeTab === "generate"}
          onClick={() => setActiveTab("generate")}
        >
          ⚡ Generate Resume
        </Button>
        <Button
          variant="tab"
          active={activeTab === "ats"}
          onClick={() => setActiveTab("ats")}
        >
          ATS Comparison
        </Button>
      </div>

      {/* CONDITIONAL RENDERING BASED ON ACTIVE TAB */}
      {activeTab === "ats" && <div className={styles.flexRow}> <ATSScore /></div>}

      {activeTab === "generate" && (
        <div className={styles.flexRow}>
          <ResumeFormBlock
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
            isLoading={isGenerating}
          />
          <ResumePreviewBlock
            isLoading={isGenerating}
            resumeData={resumeData}
            onDownload={handleDownload}
            previewRef={previewRef}
          />
        </div>
      )}

      <Footer />

      <Modal
        isOpen={isLoginModalOpen}
        title="Sign In Required"
        description="You've reached the guest limit. Sign in to get more credits and save your resumes."
        onClose={() => setLoginModalOpen(false)}
      >
        <div className={styles.signInContainer}>
          <Button
            variant="primary"
            onClick={() => {
              signInWithGoogle();
              setLoginModalOpen(false);
            }}
          >
            Sign In with Google
          </Button>
          <Button onClick={() => setLoginModalOpen(false)}>
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;