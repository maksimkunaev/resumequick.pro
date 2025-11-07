import Modal from "./Modal";
import styles from "./Modal.module.css";

function LoginModal({ isOpen, onClose, onSignIn }) {
  return (
    <Modal
      isOpen={isOpen}
      title="🔐 Sign in to continue"
      description="Please sign in to generate more resumes and save your progress."
      onCancel={onClose}
    >
      <button className={styles.button}
        onClick={onClose} >Maybe Later</button>
      <br />
      <button
        className={styles.button}
        onClick={() => {
          onClose();
          onSignIn();
        }}
      >
        Sign in with Google
      </button>
    </Modal>
  );
}
export default LoginModal;
