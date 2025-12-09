import { useState, useEffect } from 'react';
import axios from 'axios';
import { parseJwt } from "../service/authService.jsx";
import appointment_photo from '../assets/appointment-hisotry/dental-appointment.png';
import appointment_request_photo from  '../assets/request_appointment_photo/request.png'
import AppointmentAnamnesisForm from "./AppointmentAnamnesis.jsx";
import TreatmentSheetPatientView from "./TreatmentSheetPatientView.jsx";
import styles from "../assets/css/PatientAppointmentHistory.module.css"
import NavBar from "./NavBar.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function PatientAppointmentsHistory() {
    const [appointments, setAppointments] = useState([]);
    const [appointmentRequests, setAppointmentRequests] = useState([]);

    const [selectedAppointmentRequest, setSelectedAppointmentRequest] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
    const [showCancelRequestConfirmation, setShowCancelRequestConfirmation] = useState(false);

    const [showLateAppointment, setShowLateAppointment] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const [errorText, setErrorText] = useState("");

    const handleCloseErrorModal = () => {setShowErrorModal(false);}
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    const fetchAppointments = async () => {
        try {
            // Preluăm token-ul din localStorage
            const token = localStorage.getItem('token');
            const decodedToken = parseJwt(token);
            const cnp = decodedToken.cnp;

            const response = await axios.post(
                baseUrl+"/api/patient/appointments/get-patient-appointments",
                { patientCnp: cnp },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log(response.data.data)

                const fetchedAppointments = response.data.data; // Obține programările din răspuns
                setAppointments(fetchedAppointments); // Stabilește programările în state
                if (fetchedAppointments.length > 0) {
                    const firstAppointment = fetchedAppointments[0];
                }
            } else {
                console.error('Eroare la găsirea programărilor');
            }
        } catch (error) {
            console.error('Eroare la preluarea programărilor', error);
        }
    };

    useEffect(() => {
        fetchAppointmentsRequests();
        fetchAppointments();
    }, []);

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setSelectedAppointmentRequest(null); // Reset appointment request selection
    };

    const handleAppointmentRequestClick = (appointmentRequest) => {
        setSelectedAppointmentRequest(appointmentRequest);
        setSelectedAppointment(null); // Reset appointment selection
    };

    const fetchAppointmentsRequests = async () => {
        try {
            // Preluăm token-ul din localStorage
            const token = localStorage.getItem('token');
            const decodedToken = parseJwt(token);
            const cnp = decodedToken.cnp;
            console.log(cnp)
            const response = await axios.get(
                baseUrl+`/api/in/appointment_request/get_patient_requests/${cnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Trimite token-ul JWT în header-ul Authorization
                    },
                }
            );

            if (response.status === 200) {
                console.log(response.data.data)

                const fetchedAppointmentRequests = response.data.data; // Obține programările din răspuns
                setAppointmentRequests(fetchedAppointmentRequests); // Stabilește programările în state

            } else {
                console.error('Eroare la găsirea solicitarilor de programărilor');
            }
        } catch (error) {
            console.error('Eroare la preluarea solicitarilor de programări', error);
        }
    };


    const handleCancelAppointment = async (appointmentId)  => {
        if (appointmentId) {
            try{
                const token = localStorage.getItem('token');
                const patientCnp = parseJwt(token).cnp

                const now = new Date();
                const day = String(now.getDate()).padStart(2, "0");
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const year = now.getFullYear();
                const hours = String(now.getHours()).padStart(2, "0");
                const minutes = String(now.getMinutes()).padStart(2, "0");
                const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;

                const response = await axios.post(
                    baseUrl+`/api/in/notifications/admin/send_notification/cancel_appointment/${appointmentId}`,
                    {
                        date:formattedDateTime,
                        patientCnp: patientCnp
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                    }
                );

                if (response.status === 200) {
                    console.log(
                        "Programare anulata cu succes",
                        response.data
                    );
                    setErrorText("Programarea dumneavoastră a fost anulată");
                    setErrorTitle("Programare anulată");
                    setShowErrorModal(true);
                    fetchAppointments();
                    setShowCancelConfirmation(false);
                    setSelectedAppointment(null);
                } else {
                    setErrorText("Eroare la anularea programarii: " + response.statusText);
                    setErrorTitle("Eroare");
                    setShowErrorModal(true);
                }
            }
            catch (error) {
                console.error(
                    "Eroare de la server:",
                    error.response ? error.response.data : error.message
                );
                if(error.response)
                {setErrorText("Eroare la anularea programarii: " + error.response.data.message);}
                else{
                    setErrorText("Eroare la anularea programarii: " + error.message);
                }
                setErrorTitle("Eroare");
                setShowErrorModal(true);
            }
        }
    };

    const handleLateAppointment = async (selectedEventId)  => {
        console.log(selectedEventId)
        if (selectedEventId) {
            try{

                const token = localStorage.getItem('token');
                const patientCnp = parseJwt(token).cnp

                const now = new Date();
                const day = String(now.getDate()).padStart(2, "0");
                const month = String(now.getMonth() + 1).padStart(2, "0");
                const year = now.getFullYear();
                const hours = String(now.getHours()).padStart(2, "0");
                const minutes = String(now.getMinutes()).padStart(2, "0");
                const formattedDateTime = `${day}-${month}-${year} ${hours}:${minutes}`;
                const response = await axios.post(
                    baseUrl+`/api/in/notifications/admin/send_notification/late_appointment/${selectedEventId}`,
                    {
                        date:formattedDateTime,
                        patientCnp: patientCnp
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    setErrorText("Medicul a fost anunțat de întârzierea ta");
                    setErrorTitle("Întârziere anunțată");
                    setShowErrorModal(true);
                    console.log(
                        "Intarziere anuntata cu succes",
                        response.data
                    );
                    fetchAppointments()
                    setShowCancelConfirmation(false)
                    setSelectedAppointment(null)
                } else {
                    setErrorText("Eroare la anunțarea întârzierii la programare: " + response.statusText);
                    setErrorTitle("Eroare");
                    setShowErrorModal(true);
                }
            }
            catch (error) {
                console.error(
                    "Eroare de la server:",
                    error.response ? error.response.data : error.message
                );
                if(error.response)
                {setErrorText("Eroare la anunțarea întârzierii: " + error.response.data.message);}
                else{
                    setErrorText("Eroare la anunțarea întârzierii: " + error.message);
                }
                setErrorTitle("Eroare");
                setShowErrorModal(true);
            }
        }
    };


    const handleDeleteAppointmentRequest = async (selectedEventId) =>{
        if (selectedEventId) {
            console.log(selectedEventId)
            try{
                const token = localStorage.getItem('token');
                const response = await axios.delete(
                    baseUrl+`/api/in/appointment_request/delete_request/${selectedEventId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    setErrorText("Solicitarea ta a fost anulată cu succes");
                    setErrorTitle("Solicitare anulată");
                    setShowErrorModal(true);
                    fetchAppointmentsRequests()
                    setShowCancelRequestConfirmation(false)
                    setSelectedAppointmentRequest(null)
                } else {
                    setErrorText("Eroare la anularea solicitării programării: " + response.statusText);
                    setErrorTitle("Solicitare anulată");
                    setShowErrorModal(true);
                }
            }
            catch (error) {
                console.error(
                    "Eroare de la server:",
                    error.response ? error.response.data : error.message);
                if(error.response)
                {setErrorText("Eroare la anularea solicitării programării: " + error.response.data.message);}
                else{
                    setErrorText("Eroare la anularea solicitării programării: " + error.message);
                }
                setErrorTitle("Eroare");
                setShowErrorModal(true);
            }
        }
    };


    const formatDateTime = (dateString) => {
        // dateString is in the format "DD/MM/YYYY HH:mm"
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');

        const date = new Date(`${year}-${month}-${day}T${timePart}`);

        // Check if date is valid
        if (isNaN(date)) {
            return 'Invalid Date';
        }

        // Formatting the date output
        const formattedDate = date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });

        const formattedTime = date.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });

        return `${formattedDate} ${formattedTime}`;
    };

    const isFutureDate = (dateString) => {
        const [datePart, timePart] = dateString.split(' ');
        const [day, month, year] = datePart.split('/');
        const time = timePart || '00:00'; // Asigură-te că există o componentă de timp

        // Creează un string compatibil ISO pentru constructorul Date
        const isoString = `${year}-${month}-${day}T${time}`;

        // Creează obiectul Date din stringul ISO
        const appointmentDate = new Date(isoString);

        // Obține data curentă
        const currentDate = new Date();

        // Compară dacă data programării este în viitor
        return appointmentDate > currentDate;
    };

    const handleShowCancelConfirmation = () => {
        setShowCancelConfirmation(true);
    };

    const handleShowCancelRequestConfirmation = () => {
        setShowCancelRequestConfirmation(true);
    };


    const handleCancelClick = () => {
        setShowCancelConfirmation(false);
    };

    const handleCancelRequestClick = () => {
        setShowCancelRequestConfirmation(false);
    };

    const handleShowLateAppointment = () => {
        setShowLateAppointment(true);
    };

    const handleCancelClickLate = () => {
        setShowLateAppointment(false);
    };


    return (
        <div className={styles.page}>
            <NavBar></NavBar>
            <Dialog open={showErrorModal} onOpenChange={handleCloseErrorModal}>
                <DialogContent className={styles.box}>
                    <DialogHeader>
                        <DialogTitle className={styles.changeRolT}>{errorTitle}</DialogTitle>
                    </DialogHeader>
                    <p className={styles.text}>{errorText}</p>
                </DialogContent>
            </Dialog>
            <div className={styles["appointments-history-container"]}>
                <div className={styles["appointments-list"]}>
                    <p className={styles["appointments-title"]}>Istoricul programărilor tale </p>
                    <ul>
                        {Array.isArray(appointments) && appointments.length > 0 ? (
                            appointments.map((appointment) => (
                                <li
                                    key={appointment.appointmentId}
                                    onClick={() => handleAppointmentClick(appointment)}
                                    className={ styles[selectedAppointment && selectedAppointment.appointmentId === appointment.appointmentId ? 'active' : "list-element"]}
                                >
                                    <img className={styles['appointment-img']} src={appointment_photo}
                                         alt="Appointment Icon"/>
                                    <p>{formatDateTime(appointment.date)} - {appointment.appointmentReason}</p>
                                </li>

                            ))
                        ) : (
                            <p>Nu există programări disponibile.</p>
                        )}
                    </ul>
                    <ul>
                        <p className={styles["appointments-title"]}>Solicitări programări</p>
                        {Array.isArray(appointmentRequests) && appointmentRequests.length > 0 ? (
                            appointmentRequests.map((appointmentRequest) => (
                                <li
                                    key={appointmentRequest.appointmentRequestId}
                                    onClick={() => handleAppointmentRequestClick(appointmentRequest)}
                                    className={styles[selectedAppointmentRequest && selectedAppointmentRequest.appointmentRequestId === appointmentRequest.appointmentRequestId ? 'active' : "list-element"]}

                                >
                                    <img className={styles['appointment-img']} src={appointment_request_photo}
                                         alt="Appointment Icon"/>
                                    <span>{appointmentRequest.requestDate}</span>
                                </li>

                            ))
                        ) : (
                            <p>Nu există solicitări active.</p>
                        )}
                    </ul>
                </div>

                <div className={styles["appointment-details"]}>
                    {selectedAppointment ? (
                        <div>
                            <p className={styles.appDet}>Detalii Programare</p>
                            <p><strong>Data:</strong> {formatDateTime(selectedAppointment.date)}</p>
                            <p><strong>Motiv prezentare:</strong> {selectedAppointment.appointmentReason}</p>
                            <AppointmentAnamnesisForm appointmentId={selectedAppointment.appointmentId}
                                                      appointmentReason={selectedAppointment.appointmentReason}/>
                            <TreatmentSheetPatientView appointmentId={selectedAppointment.appointmentId}/>

                            {isFutureDate(selectedAppointment.date) && (
                                <div>
                                    {!showCancelConfirmation ? (
                                        <button onClick={handleShowCancelConfirmation}>
                                            Anulează programare
                                        </button>
                                    ) : (
                                        <div className={styles["cancel-section"]}>
                                            <p className={styles["cancel-message"]}>
                                                Doriți să anulați această programare? Odată confirmată anularea, medicul
                                                va fi informat și veți putea face o nouă programare ulterior.
                                            </p>
                                            <div className={styles["action-buttons"]}>
                                                <button onClick={()=>handleCancelAppointment(selectedAppointment.appointmentId)}
                                                        className={styles["confirm-button"]}>
                                                    Confirmă anularea
                                                </button>
                                                <button onClick={handleCancelClick} className={styles["close-button"]}>
                                                    Renunță
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {!showLateAppointment ? (
                                        <button onClick={handleShowLateAppointment}>
                                            Anunță întârziere
                                        </button>
                                    ) : (
                                        <div className={styles["cancel-section"]}>
                                            <p className={styles["cancel-message"]}>
                                                Vă informăm că aveți posibilitatea de a anunța medicul despre orice
                                                întârziere
                                                în sosirea dumneavoastră. Aceasta ne ajută să ne organizăm programul și
                                                să
                                                vă oferim cea mai bună experiență posibilă. Vă mulțumim pentru
                                                înțelegere! </p>
                                            <div className={styles["action-buttons"]}>
                                                <button onClick={() =>handleLateAppointment(selectedAppointment.appointmentId)}
                                                        className={styles["confirm-button"]}>
                                                    Confirmă întarziere
                                                </button>
                                                <button onClick={handleCancelClickLate}
                                                        className={styles["close-button"]}>
                                                    Renunță
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            )}
                        </div>
                    ) : selectedAppointmentRequest ? (
                            <div>
                                <p className={styles.appDet}>Detalii Solicitare Programare</p>
                                <p><strong>Data solicitării:</strong> {selectedAppointmentRequest.requestDate}</p>
                                <p><strong>Motiv solicitare:</strong> {selectedAppointmentRequest.appointmentReason}</p>
                                <p><strong>Timpul dorit:</strong> {selectedAppointmentRequest.desiredAppointmentTime}</p>
                                <p><strong>Status:</strong> ÎN AȘTEPTARE</p>

                                {!showCancelRequestConfirmation ? (
                                    <button onClick={handleShowCancelRequestConfirmation}>
                                        Anulează solicitarea
                                    </button>
                                ) : (
                                    <div className={styles["cancel-section"]}>
                                        <p className={styles["cancel-message"]}>
                                            Doriți să anulați această solicitare? Odată confirmată anularea,acțiunea este ireversibilă.
                                        </p>
                                        <div className={styles["action-buttons"]}>
                                            <button onClick={() => handleDeleteAppointmentRequest(selectedAppointmentRequest.appointmentRequestId)}
                                                    className={styles["confirm-button"]}>
                                                Confirmă anularea
                                            </button>
                                            <button onClick={handleCancelRequestClick} className={styles["close-button"]}>
                                                Renunță
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )

                        : (
                            <p>Selectează o programare sau o solicitare pentru a vedea detaliile.</p>
                    )}
                </div>
            </div>
        </div>
    );
}


export default PatientAppointmentsHistory;
