import React from "react";
import styles from "../App.module.css";

const ResumeForm = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  buttonStyle,
}) => {
  return (
    <form onSubmit={onSubmit} autoComplete="off">
      <div>
        <label className={styles.formLabel} htmlFor="name">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          className={styles.input}
          placeholder="Enter your name"
        />
      </div>
      <div>
        <label className={styles.formLabel} htmlFor="skills">
          Skills
        </label>
        <input
          id="skills"
          type="text"
          name="skills"
          value={formData.skills}
          onChange={onChange}
          className={styles.input}
          placeholder="Separate skills with commas"
        />
      </div>
      <div>
        <label className={styles.formLabel} htmlFor="experience">
          Experience
        </label>
        <textarea
          id="experience"
          name="experience"
          value={formData.experience}
          onChange={onChange}
          rows={3}
          className={styles.textarea}
          placeholder="Describe your work experience, achievements, or key projects..."
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={buttonStyle || `${styles.button} ${styles.generateButton}`}
      >
        {isLoading && (
          <svg
            className={styles.spinner}
            style={{ marginRight: 8, height: 18, width: 18 }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        {isLoading ? "Generating..." : (
          <span>⚡ Generate{'  '}<span style={{
            opacity: 0.8,
            fontSize: "0.8rem",
            lineHeight: '1'
          }}></span></span>
        )}
      </button>
    </form>
  );
};

export default ResumeForm;
