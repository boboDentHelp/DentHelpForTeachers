import {parseJwt} from "../../service/authService.jsx";
import axios from "axios";
import {useEffect, useState} from "react";
import appointment_photo from "../../assets/appointment-hisotry/dental-appointment.png";
import AppointmentAnamnesisForm from "../AppointmentAnamnesis.jsx";
import TreatmentSheetDoctor from "./TreatmentSheetDoctor.jsx";
import styles from "../../assets/css/PatientAppointmentHistory.module.css"

//medicul sa vada toate programarile unui pacient
function PatientAppointmentsForDoctor(props){
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchAppointments = async () => {
        try {
            const token = localStorage.getItem('token');
            const cnp = props.cnp;

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
                const fetchedAppointments = response.data.data;
                setAppointments(fetchedAppointments);
            } else {
                console.error('Eroare la găsirea programărilor');
            }
        } catch (error) {
            console.error('Eroare la preluarea programărilor', error);
        }
    };

    useEffect(() => {
        if (props.cnp) {
            fetchAppointments()
            setSelectedAppointment()
        }
    }, [props.cnp]);
    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        const options = {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // pentru format 24 de ore
        };
        return date.toLocaleString('en-US', options).replace(',', '');
    };

    return (
        <div className={styles["appointments-history-container"]}>
            <div className={styles["appointments-list"]}>
                <p className={styles.appointments_title}>Istoricul programărilor pacientului </p>
                <ul>
                    {Array.isArray(appointments) && appointments.length > 0 ? (
                        appointments.map((appointment) => (
                            <li
                                key={appointment.appointmentId}
                                onClick={() => handleAppointmentClick(appointment)}

                                className={selectedAppointment && selectedAppointment.id === appointment.id ? 'active' : ''}
                                style={{ display: 'flex', alignItems: 'center', margin: '8px 0', cursor: 'pointer', padding: '8px', border: '1px solid #e0e0e0', borderRadius: '4px' }}
                            >
                                <img src={appointment_photo} alt="Appointment Icon" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                                <p>{appointment.date} - {appointment.appointmentReason}</p>
                            </li>

                        ))
                    ) : (
                        <p>Nu există programări disponibile.</p>
                    )}
                </ul>
            </div>

            <div className={styles["appointment-details"]}>
                {selectedAppointment ? (
                    <div>
                        <p className={styles.appointmentT}>Detalii Programare</p>
                        <p><strong>Data:</strong> {selectedAppointment.date}</p>
                        <p><strong>Motivul programării:</strong> {selectedAppointment.appointmentReason}</p>
                        <AppointmentAnamnesisForm appointmentId={selectedAppointment.appointmentId} appointmentReason={selectedAppointment.appointmentReason} />
                        <TreatmentSheetDoctor appointmentId={selectedAppointment.appointmentId}></TreatmentSheetDoctor>
                    </div>
                ) : (
                    <p>Selectează o programare pentru a vedea detaliile.</p>
                )}
            </div>
        </div>
    );
}

export default PatientAppointmentsForDoctor;