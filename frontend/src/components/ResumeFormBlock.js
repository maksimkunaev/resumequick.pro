import ResumeForm from "./ResumeForm";
import styles from "../App.module.css";

function ResumeFormBlock({ formData, onChange, onSubmit, isLoading }) {
  return (
    <div className={styles.resumeFormBlock}>
      <h2 className={styles.formBlockTitle}>Personal Information</h2>
      <ResumeForm
        formData={formData}
        onChange={onChange}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
export default ResumeFormBlock;
