import axios from "axios";
import {useEffect, useState} from "react";
import styles from "../assets/css/TreatmentSheetPatientView.module.css";
import PropTypes from "prop-types";
import arrow_up from "../assets/icons/upload.png"
import arrow_down from "../assets/icons/arrow-down-sign-to-navigate.png"
import { InfoCircledIcon } from "@radix-ui/react-icons";

function TreatmentSheetPatientView(props){

    const [appointmentObservations, setAppointmentObservations] = useState("");
    const [recommendations, setRecommendations] = useState("");
    const [medication, setMedication] = useState("");
    const [showTreatmentSheetForm, setShowTreatmentSheetForm] = useState(false);
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchData = async () => {
        if (!props.appointmentId) {
            return; // Don't fetch if no appointment ID is provided
        }
        try {
            const response = await axios.get(
                baseUrl+`/api/in/treatment-sheet/get-treatment-sheet/${props.appointmentId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200 && response.data.data) {
                setAppointmentObservations(response.data.data.appointmentObservations);
                setMedication(response.data.data.medication);
                setRecommendations(response.data.data.recommendations);
            }
        } catch (error) {
            console.error("Eroare la obținerea datelor: ", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [props.appointmentId]);
    const toggleTreatmentForm = () => {
        setShowTreatmentSheetForm(!showTreatmentSheetForm); // Comută vizibilitatea formularului
    };
    return (
        <div className={styles["form"]}>
            <div className={styles.actionButtons}>
                <button onClick={toggleTreatmentForm} className={styles["buttonTreatmentSheet"]}>Fișa Tratament</button>
                <img className={styles["arrow"]} src={!showTreatmentSheetForm ? arrow_down: arrow_up}/>
            </div>
            {showTreatmentSheetForm &&(
                <div className={styles.dataView}>
                    <p className={styles.infoMessage}>
                        <InfoCircledIcon className="inline-block" /> Este posibil ca medicul să nu fi completat încă fișa de tratament.
                    </p>
                    <p><strong>Observațile programarii:</strong> {appointmentObservations}</p>
                    <p><strong>Tratement medical:</strong> {medication}</p>
                    <p><strong>Recomandari post tratament:</strong>{recommendations}</p>
                </div>
            )}
        </div>
    )

}

TreatmentSheetPatientView.propTypes = {
    appointmentId: PropTypes.number
};

TreatmentSheetPatientView.defaultProps = {
    appointmentId: null
};
export default TreatmentSheetPatientView