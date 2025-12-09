
import styles from "../assets/css/InfoBox.module.css";

const InfoBox = ({ message, onClose }) => {
    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <p className={styles["message"]}>{message}</p>
                <button type="button" className={styles.closeButton} onClick={onClose}>
                        X
                </button>
            </div>
        </div>
    );
};

export default InfoBox;
