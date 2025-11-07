// ATSScore.js
import React, { useState } from 'react';
import { evaluateATS } from '../api/atsService';
import useUser from '../hooks/useUser';
import styles from './ATSScore.module.css';

const ATSScore = () => {
    const { user } = useUser();
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const data = await evaluateATS({
                resumeText,
                jobDescription,
                user
            });
            setResult(data);
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>ATS Comparison</h1>
                <p className={styles.description}>
                    Compare your CV against a specific job description to optimize for ATS systems
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.formSection}>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Job Description</label>
                            <textarea
                                className={styles.textarea}
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Your CV Description</label>
                            <textarea
                                className={styles.textarea}
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste your CV content here..."
                                required
                            />
                        </div>

                        <button className={styles.button} type="submit" disabled={isLoading}>
                            🔍 {isLoading ? 'Analyzing...' : 'Analyze ATS Compatibility'}
                        </button>
                    </form>
                </div>

                <div className={styles.resultsSection}>
                    {result ? (
                        <div>
                            <h3 className={styles.scoreTitle}>Basic ATS Score: {result.ats_score}%</h3>
                            <div className={styles.skillsContainer}>
                                <p className={styles.skillsText}>
                                    <strong>Matched Skills:</strong> {result.matched_skills?.join(', ') || 'None'}
                                </p>
                                <p className={styles.skillsText}>
                                    <strong>Missing Skills:</strong> {result.missing_skills?.join(', ') || 'None'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            Results will appear here after analysis
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ATSScore;