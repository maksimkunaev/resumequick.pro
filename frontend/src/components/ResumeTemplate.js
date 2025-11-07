import React from "react";

const CONTACT_LABELS = {
  email: "Email",
  github: "GitHub",
  location: "Location",
  phone: "Phone",
};

const getContactLink = (key, value) => {
  if (key === "email") return `mailto:${value}`;
  if (key === "phone") return `tel:${value}`;
  if (key === "github")
    return value.startsWith("http") ? value : `https://github.com/${value}`;
  return null;
};

const resumeStyles = {
  container: {
    fontFamily: "Arial, Calibri, sans-serif",
    fontSize: "11pt",
    lineHeight: "1.5",
    color: "#222",
  },
  header: {
    textAlign: "left",
    marginBottom: "8px",
  },
  name: {
    fontSize: "22pt",
    fontWeight: "bold",
    letterSpacing: "0.5px",
    marginBottom: "2px",
    textTransform: "none",
    color: "#222",
  },
  headline: {
    fontSize: "12pt",
    color: "#444",
    marginBottom: "12px",
    marginTop: "2px",
  },
  contactWrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    fontSize: "10pt",
    color: "#444",
    marginBottom: "18px",
  },
  contactItem: {
    display: "inline-block",
  },
  section: {
    marginBottom: "26px",
  },
  sectionTitle: {
    fontSize: "11.8pt",
    fontWeight: 700,
    color: "#222",
    borderBottom: "1px solid #bbb",
    paddingBottom: "2px",
    marginBottom: "10px",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  summary: {
    fontSize: "11pt",
    color: "#222",
    marginBottom: "0",
  },
  skillCategory: {
    marginBottom: "10px",
  },
  skillCategoryName: {
    fontWeight: 600,
    marginBottom: "2px",
    color: "#222",
  },
  skillList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    fontSize: "11pt",
  },
  skill: {
    // no background, no border
    fontSize: "10.5pt",
    color: "#333",
    padding: 0,
    margin: 0,
  },
  workItem: {
    marginBottom: "18px",
  },
  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "2px",
    fontWeight: 600,
    fontSize: "11pt",
  },
  jobTitle: {
    fontStyle: "italic",
    marginBottom: "2px",
    color: "#444",
    fontSize: "10.5pt",
    fontWeight: 400,
  },
  jobLocation: {
    fontSize: "10pt",
    color: "#666",
    marginBottom: "2px",
  },
  achievements: {
    margin: "0 0 0 18px",
    padding: 0,
    color: "#222",
    fontSize: "10.8pt",
  },
  achievementItem: {
    marginBottom: "5px",
  },
  educationItem: {
    marginBottom: "10px",
  },
  degree: {
    fontWeight: 600,
    fontSize: "11pt",
  },
  institution: {
    color: "#333",
    fontSize: "10.5pt",
    marginBottom: "0",
  },
};

const ResumeTemplate = ({ resumeData }) => {
  if (!resumeData) return null;

  const {
    name,
    contact = {},
    headline,
    professional_summary,
    work_experience = [],
    skills = { categories: [] },
    education = [],
  } = resumeData;

  return (
    <div
      style={resumeStyles.container}
      // className="resumeContainer"
      contentEditable
      suppressContentEditableWarning={true}
    >
      <header style={resumeStyles.header}>
        <div style={resumeStyles.name}>{name}</div>
        {headline && <div style={resumeStyles.headline}>{headline}</div>}
        <div style={resumeStyles.contactWrapper}>
          {Object.entries(contact)
            .filter(([_, value]) => value && value !== "Unknown")
            .map(([key, value], idx) => (
              <span key={key} style={resumeStyles.contactItem}>
                {getContactLink(key, value) ? (
                  <a
                    href={getContactLink(key, value)}
                    style={{ color: "#444", textDecoration: "none" }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {value}
                  </a>
                ) : (
                  value
                )}
                {idx <
                  Object.entries(contact).filter(
                    ([_, v]) => v && v !== "Unknown"
                  ).length -
                  1 && (
                    <span style={{ color: "#bbb", margin: "0 6px" }}>|</span>
                  )}
              </span>
            ))}
        </div>
      </header>

      {professional_summary && (
        <section style={resumeStyles.section}>
          <div style={resumeStyles.sectionTitle}>Professional Summary</div>
          <div style={resumeStyles.summary}>{professional_summary}</div>
        </section>
      )}

      {skills.categories.length > 0 && (
        <section style={resumeStyles.section}>
          <div style={resumeStyles.sectionTitle}>Skills</div>
          {skills.categories.map((category, index) => (
            <div key={index} style={resumeStyles.skillCategory}>
              <div style={resumeStyles.skillCategoryName}>{category.name}:</div>
              <div style={resumeStyles.skillList}>
                {category.items.map((skill, idx) => (
                  <span key={idx} style={resumeStyles.skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {work_experience.length > 0 && (
        <section style={resumeStyles.section}>
          <div style={resumeStyles.sectionTitle}>Experience</div>
          {work_experience.map((job, index) => (
            <div key={index} style={resumeStyles.workItem}>
              <div style={resumeStyles.jobHeader}>
                <span>{job.company}</span>
                <span>{job.date_range}</span>
              </div>
              <div style={resumeStyles.jobTitle}>{job.position}</div>
              {job.location && job.location !== "Unknown" && (
                <div style={resumeStyles.jobLocation}>{job.location}</div>
              )}
              <ul style={resumeStyles.achievements}>
                {job.achievements.map((achievement, idx) => (
                  <li key={idx} style={resumeStyles.achievementItem}>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {education.length > 0 && (
        <section style={resumeStyles.section}>
          <div style={resumeStyles.sectionTitle}>Education</div>
          {education.map((edu, index) => (
            <div key={index} style={resumeStyles.educationItem}>
              <div style={resumeStyles.degree}>{edu.degree}</div>
              <div style={resumeStyles.institution}>
                {edu.institution}
                {edu.year && edu.year !== "Unknown" && `, ${edu.year}`}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ResumeTemplate;
