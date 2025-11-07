import ResumeTemplate from "./ResumeTemplate";
import styles from "../App.module.css";
import { resumeMock } from '../api/constants';

function ResumeExampleBlock() {
  return (
    <div className={`${styles.resumePreviewBlock} ${styles.resumeExample}`}>
      <div className={styles.resumePreviewHeader}>
        <div>Your generated resume will appear here✨</div>
      </div>
      <hr />
      <div>
        <ResumeTemplate resumeData={resumeMock.result?.resumeData} />
      </div>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className={styles.resumePreviewBlock}>
      <div className={styles.resumePreviewHeader}>
        <div>Generating your resume...</div>
      </div>
      <hr />
      <div className={styles.loadingSpinner}>
        <div className={styles.spinner}></div>
        <p>Creating your professional resume</p>
      </div>
    </div>
  );
}

function ResumePreviewBlock({ resumeData, onDownload, previewRef, isLoading }) {
  if (isLoading) {
    return <LoadingBlock />;
  }

  if (!resumeData) {
    return <ResumeExampleBlock />
  }

  return (
    <div className={styles.resumePreviewBlock}>
      <div className={styles.resumePreviewHeader}>
        <button className={styles.resumeExportBtn} onClick={onDownload}>
          Export PDF
        </button>
      </div>
      <hr />

      <div ref={previewRef}>
        <ResumeTemplate resumeData={resumeData} />
      </div>
    </div>
  );
}
export default ResumePreviewBlock;