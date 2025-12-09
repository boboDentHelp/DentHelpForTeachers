import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from "../assets/css/AppointmentAnamnesis.module.css";
import arrow_down from "../assets/icons/arrow-down-sign-to-navigate.png";
import arrow_up from "../assets/icons/upload.png";

function AppointmentAnamnesisForm(props) {
    const [anamnesisExists, setAnamnesisExists] = useState(false);
    const [currentMedication, setCurrentMedication] = useState('');
    const [recentMedication, setRecentMedication] = useState('');
    const [currentSymptoms, setCurrentSymptoms] = useState('');
    const [pregnancy, setPregnancy] = useState(null);
    const [showAnamnesisForm, setShowAnamnesisForm] = useState(false);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    // Funcția pentru a prelua anamneza de la API
    const fetchAnamnesis = async () => {
        if (props.appointmentId == null) {
            setAnamnesisExists(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(baseUrl+`/api/in/appointment/getAnamnesisAppointment/${props.appointmentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(response.data.data === null) {
                setAnamnesisExists(false);
                setCurrentMedication('');
                setRecentMedication('');
                setCurrentSymptoms('');
                setPregnancy(null);
            } else if (response.status === 200 && response.data.data != null) {
                console.log(response.data)
                setCurrentMedication(response.data.data.currentMedication || '');
                setRecentMedication(response.data.data.recentMedication || '');
                setCurrentSymptoms(response.data.data.currentSymptoms || '');
                setPregnancy(response.data.data.pregnancy);
                setAnamnesisExists(true);
            }
        } catch (error) {
            console.error('Eroare la preluarea anamnezei', error);
            setAnamnesisExists(false);
        }
    };

    useEffect(() => {
        fetchAnamnesis();
    }, [props.appointmentId]);

    const handleSaveAnamnesis = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                baseUrl+`/api/in/appointment/saveAppointmentAnamnesis`,
                {
                    appointmentId: props.appointmentId,
                    appointmentReason: props.appointmentReason,
                    currentMedication,
                    recentMedication,
                    currentSymptoms,
                    pregnancy
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setAnamnesisExists(true); // Setează că anamneza acum există
                setCurrentMedication('');
                setRecentMedication('');
                setCurrentSymptoms('');
                setPregnancy(null);
                fetchAnamnesis(); // Actualizează datele după salvare
            }
        } catch (error) {
            console.error('Eroare la salvarea anamnezei', error);
        }
    };

    const toggleAnamnesisForm = () => {
        setShowAnamnesisForm(!showAnamnesisForm);
    };

    return (
        <div className="anamnesis-container">

            <div className={styles.actionButtons}>
                <button onClick={toggleAnamnesisForm} className={styles.anamnesisAppointmentButton}> Anamneza Programării</button>
                <img className={styles["arrow"]} src={!showAnamnesisForm ? arrow_down : arrow_up}/>
            </div>

            {/* Formularul de anamneză - afișat doar când showAnamnesisForm este true */}
            {showAnamnesisForm && (
                <div>
                    {!anamnesisExists ? (
                        <div className={styles.formAnamnesis}>
                            <div className={styles['formGroup']}>
                                <label htmlFor="current-medication-input">Medicație curentă:</label>
                                <input type="text" placeholder="scrieți răspunsul" required
                                    className={styles["current-medication-input"]}
                                    value={currentMedication}
                                    onChange={(e) => setCurrentMedication(e.target.value)}
                                />
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="recent-medication-input">Medicație recentă:</label>
                                <input
                                    type="text"
                                    placeholder="scrie răspunsul"
                                    required
                                    id="recent-medication-input"
                                    value={recentMedication}
                                    onChange={(e) => setRecentMedication(e.target.value)}
                                />
                            </div>

                            <div className={styles['formGroup']}>
                                <label htmlFor="symptoms-input">Simptome:</label>
                                <input
                                    type="text"
                                    placeholder="scrie răspunsul"
                                    required
                                    id="symptoms-input"
                                    value={currentSymptoms}
                                    onChange={(e) => setCurrentSymptoms(e.target.value)}
                                />
                            </div>

                            <div className={styles['formGroup']}>
                                <label>Sunteți însărcinată?</label>
                                <div className={styles['boolean-group']}>
                                    <div className={styles.options}>
                                        <label>Da</label>
                                        <input
                                            type="radio"
                                            name="pregnancy"
                                            value="true"
                                            checked={pregnancy === true}
                                            onChange={() => setPregnancy(true)}
                                        />
                                    </div>
                                    <div className={styles.options}>
                                        <label>Nu</label>
                                        <input
                                            type="radio"
                                            name="pregnancy"
                                            value="false"
                                            checked={pregnancy === false}
                                            onChange={() => setPregnancy(false)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <button className={styles.saveAnamnesisButton} onClick={handleSaveAnamnesis}>
                                Salvează Anamneza
                            </button>
                        </div>
                    ) : (
                        <div className={styles["dataView"]}>
                            <p><strong>Medicație curentă:</strong> {currentMedication}</p>
                            <p><strong>Medicație recentă:</strong> {recentMedication}</p>
                            <p><strong>Simptome:</strong> {currentSymptoms}</p>
                            <p><strong>Sunteți însărcinată? </strong>{pregnancy==="true" ? "da" : "nu"}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Adaugăm validarea prop-types pentru appointmentId
AppointmentAnamnesisForm.propTypes = {
    appointmentId: PropTypes.number.isRequired, // Asigură-te că tipul este corect
    appointmentReason: PropTypes.string.isRequired, // Adaugă validarea pentru prop-ul appointmentReason
};

export default AppointmentAnamnesisForm;
