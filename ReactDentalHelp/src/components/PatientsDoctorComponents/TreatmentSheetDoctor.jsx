import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../../assets/css/AppointmentAnamnesis.module.css";
import arrow_down from "../../assets/icons/arrow-down-sign-to-navigate.png";
import arrow_up from "../../assets/icons/upload.png";

function TreatmentSheetDoctor(props) {
    const [appointmentObservations, setAppointmentObservations] = useState("");
    const [recommendations, setRecommendations] = useState("");
    const [medication, setMedication] = useState("");
    const [showTreatmentSheetForm, setShowTreatmentSheetForm] = useState(false); // Show or hide the treatment sheet section
    const [isEditing, setIsEditing] = useState(false); // Whether we're editing or viewing the form
    const [isNewSheet, setIsNewSheet] = useState(false); // Whether the sheet is new or already exists
    const token = localStorage.getItem("token");
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    // Fetch data and determine if the sheet already exists
    const fetchData = async () => {
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
                setIsNewSheet(false); // Set false if treatment sheet exists
            } else {
                setIsNewSheet(true); // If no data, set to true
            }
        } catch (error) {
            console.error("Eroare la obținerea datelor: ", error);
            setIsNewSheet(true); // Assume it's new if error
        }
    };

    useEffect(() => {
        fetchData();
        resetState();
    }, [props.appointmentId]);



    const resetState = ()=> {
            setMedication("");
            setAppointmentObservations("");
            setRecommendations("")
    };

    // Save the form (for creating or editing)
    const handleSave = async () => {
        try {
            const payload = {
                appointmentObservations,
                recommendations,
                medication,
                appointmentId: props.appointmentId
            };

            if (isNewSheet) {
                // Create new treatment sheet
                await axios.post(
                    baseUrl+`/api/in/treatment-sheet/save-treatment-sheet`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                setIsNewSheet(false); // Set to false after creation
            } else {
                // Update existing treatment sheet
                await axios.put(
                    baseUrl+`/api/in/treatment-sheet/update-sheet-treatment`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
            }
            setIsEditing(false); // Switch back to view mode after save
        } catch (error) {
            console.error("Eroare la salvarea datelor: ", error);
        }
    };


    const toggleAnamnesisForm = () => {
        setShowTreatmentSheetForm(!showTreatmentSheetForm);
    };

    return (
        <div>
            <div className={styles.actionButtons}>
                <button onClick={toggleAnamnesisForm} className={styles.anamnesisAppointmentButton}> Fișa medicală
                </button>
                <img className={styles["arrow"]} src={!showTreatmentSheetForm ? arrow_down : arrow_up}/>
            </div>

            {showTreatmentSheetForm && (
                <div>
                    {/* If the treatment sheet already exists, show options to view or edit */}
                    {!isNewSheet ? (
                        <div>
                            <button onClick={() => setIsEditing(false)} className={styles.ViewOrEditBtn}>
                                Vizualizează
                            </button>
                            <button onClick={() => setIsEditing(true)} className={styles.ViewOrEditBtn}>
                                Editează
                            </button>
                        </div>
                    ) : (
                        <p></p>
                    )}

                    {isEditing || isNewSheet ? (
                        <div className={styles.formAnamnesis}>
                            <div className={styles.formGroup}>
                            <label>
                                Observați din timpul programării:
                                <input
                                    type="text"
                                    placeholder="scrie răspunsul"
                                    value={appointmentObservations}
                                    onChange={(e) =>
                                        setAppointmentObservations(e.target.value)
                                    }
                                />
                            </label>
                            </div>
                            <div className={styles.formGroup}>

                            <label>
                                Tratamente medicale:
                                <input
                                    type="text"
                                    value={medication}
                                    placeholder="scrie răspunsul"
                                    onChange={(e) => setMedication(e.target.value)}
                                />
                            </label>
                            </div>
                            <div className={styles.formGroup}>

                            <label>
                                Recomandări post intervenție:
                                <input
                                    type="text"
                                    value={recommendations}
                                    placeholder="scrie răspunsul"
                                    onChange={(e) => setRecommendations(e.target.value)}
                                />
                            </label>
                            </div>
                            <button onClick={handleSave} className={styles.saveAnamnesisButton}>
                                {isNewSheet ? "Salvează Fișa" : "Salvează Modificările"}
                            </button>
                        </div>
                    ) : (
                        // Show data if in view mode
                        <div className={styles.dataView}>
                            <p className={styles.viewtext}>Vizualizare Fișă</p>
                            <p><strong>Observații programare:</strong> {appointmentObservations}</p>
                            <p><strong>Tratamente medicale:</strong> {medication}</p>
                            <p><strong>Recomandări post tratament:</strong> {recommendations}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

TreatmentSheetDoctor.propTypes = {
    appointmentId: PropTypes.number.isRequired,
};

export default TreatmentSheetDoctor;
