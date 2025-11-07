import React, { useState, useEffect, useRef } from "react";
import { submitFeedback } from "../api/feedbackService";
import styles from "./Feedback.module.css";

const FeedbackSystem = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Use ref to store timeout ID
  const timeoutRef = useRef(null);

  // Reset form state
  const resetForm = () => {
    setRating(0);
    setFeedbackType("general");
    setMessage("");
    setEmail("");
    setConsent(false);
    setSuccess(false);
    setError("");
  };

  // Clear timeout and reset when closing
  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
    resetForm();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await submitFeedback({
        rating,
        type: feedbackType,
        message,
        email: email || undefined,
      })
        .then((success) => {
          setSuccess(true);
          setIsSubmitting(false);

          // Store timeout ID in ref
          timeoutRef.current = setTimeout(() => {
            handleClose();
          }, 10000);
        })
        .catch((error) => {
          setError("Failed to submit feedback. Please try again.");
          setIsSubmitting(false);
        });
    } catch (error) {
      setError("Failed to submit feedback. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={() => setIsOpen(true)}>
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={handleClose} />
          <div className={styles.modal}>
            <button className={styles.closeButton} onClick={handleClose}>
              ×
            </button>

            {success ? (
              <div className={styles.successMessage}>
                <svg
                  viewBox="0 0 24 24"
                  width="48"
                  height="48"
                  className={styles.successIcon}
                >
                  <circle cx="12" cy="12" r="10" fill="#28a745" />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
                <h3>Thank you for your feedback!</h3>
                <p>We appreciate your input.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <h2>Share Your Feedback</h2>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Rating</label>
                  <div className={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`${styles.star} ${
                          star <= rating ? styles.starFilled : ""
                        }`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Email (optional)</label>
                  <input
                    type="email"
                    className={styles.email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Category</label>
                  <select
                    className={styles.select}
                    value={feedbackType}
                    onChange={(e) => setFeedbackType(e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="bug">Bug Report</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Comments</label>
                  <textarea
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please share your thoughts..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className={styles.checkbox}
                    />
                    I agree to be contacted about this feedback
                  </label>
                </div>

                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={isSubmitting || !consent || rating === 0}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default FeedbackSystem;
