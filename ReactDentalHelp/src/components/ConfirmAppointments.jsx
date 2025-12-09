import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../assets/css/ConfirmAppointments.module.css"
import InfoBox from "./InfoBox.jsx";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";

function ConfirmAppointments() {
    const [appointmentsRequests, setAppointmentsRequests] = useState([]);
    const [confirmData, setConfirmData] = useState({});
    const [visibleSubmenu, setVisibleSubmenu] = useState({});
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [infoConfirmAppBoxVisible, setConfirmAppBoxVisible] = useState(false);
    const [infoRejectAppBoxVisible, setRejectAppBoxVisible] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage]= useState("");
    const [rejectMessage, setRejectMessage] = useState("");
    const [confirmRejectRequest, setConfirmRejectRequest] = useState(false);
    const [selectedRequestForReject, setSelectedRequestForReject] = useState(false)
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const closeInfoConfirmAppBox = () => {
        setConfirmAppBoxVisible(false);
    };

    const closeInfoRejectAppBox = () => {
        setRejectAppBoxVisible(false);
    };
    const fetchPatientByCnp = async (patientCnp) => {
        try {
            console.log(patientCnp);
            const response = await axios.get(
                baseUrl+`/api/admin/auth/get-patient-info/${patientCnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                const data = response.data.data;
                const complete_name = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Unknown Patient";
                return complete_name; // Returnează numele pacientului
            }
        } catch (error) {
            console.error("Eroare la extragerea pacientului:", error);
            return "Unknown Patient"; // Return default value on error
        }
    };

    // Funcție pentru a obține toate cererile de programări
    const fetchAppointmentsRequests = async () => {
        try {
            const response = await axios.get(
                baseUrl+"/api/admin/confirm-appointments/get-appointments-request",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const data = response.data.data;
            if (Array.isArray(data)) {
                // Folosim Promise.all pentru a aștepta numele pacienților înainte de a seta starea
                const filteredData = data.filter(appointmentRequest => {
                    // Check if appointment request has valid patient data
                    if (!appointmentRequest) {
                        console.warn("Found null or undefined appointment request");
                        return false;
                    }
                    if (!appointmentRequest.patientCnp) {
                        console.warn("Appointment request missing patient CNP:", appointmentRequest);
                        return false;
                    }
                    return true;
                });

                const apiAppReqs = await Promise.all(
                    filteredData.map(async (appointmentRequest) => {
                        try {
                            return {
                                appReason: appointmentRequest.appointmentReason || "N/A",
                                appTime: appointmentRequest.desiredAppointmentTime || "N/A",
                                patientCnp: appointmentRequest.patientCnp,
                                patientName: await fetchPatientByCnp(appointmentRequest.patientCnp),
                                id: appointmentRequest.appointmentRequestId,
                            };
                        } catch (error) {
                            console.error("Error processing appointment request:", error);
                            return null;
                        }
                    })
                );

                // Filter out any null results from errors
                const validAppReqs = apiAppReqs.filter(req => req !== null);
                setAppointmentsRequests(validAppReqs);
                console.log(validAppReqs);
            } else {
                console.error("Datele primite nu sunt un array:", data);
            }
        } catch (error) {
            console.error("Eroare la preluarea cererilor de programare:", error);
        }
    };

    useEffect(() => {
        fetchAppointmentsRequests();
    }, []);

    const handleConfirm = async (id) => {
        const { date, start_time, end_time } = confirmData[id] || {};
        if (!date || !start_time || !end_time) {
            setShowError(true);
            setErrorMessage("Completati fiecare camp!")
            return;
        }

        const startAppointmentDateTimeObj = new Date(`${date}T${start_time}`);
        const startFormattedDate = startAppointmentDateTimeObj.toLocaleDateString("en-GB");
        const startFormattedTime = startAppointmentDateTimeObj.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const startAppointmentDateTime = `${startFormattedDate} ${startFormattedTime}`;

        const endAppointmentDateTimeObj = new Date(`${date}T${end_time}`);
        const endFormattedDate = endAppointmentDateTimeObj.toLocaleDateString("en-GB");
        const endFormattedTime = endAppointmentDateTimeObj.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const endAppointmentDateTime = `${endFormattedDate} ${endFormattedTime}`;
        const appointmentRequest = appointmentsRequests.find((request) => request.id === id);

        if (!appointmentRequest) {
            setShowError(true);
            setErrorMessage("Cererea de programare nu a fost găsită.")
            return;
        }
        console.log(appointmentRequest.patientCnp);

        try {
            await axios.post(
                baseUrl+`/api/admin/confirm-appointments/save-appointments`,
                {
                    requestId: id,
                    date: startAppointmentDateTime,
                    hour: endAppointmentDateTime,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setConfirmAppBoxVisible(true)
            fetchAppointmentsRequests();
        } catch (error) {
            setShowError(true);
            setErrorMessage("Eroare la confirmarea cererii.")
            console.error("Eroare la confirmarea cererii:", error);
        }
    };

    const handleCloseConfirmRejectRequest =()=>{
        setConfirmRejectRequest(false);
    }

    const handleOpenConfirmRejectRequest =(requestId)=>{
        setSelectedRequestForReject(requestId)
        setConfirmRejectRequest(true);
    }

    const rejectRequest = async ()=>{
        setConfirmRejectRequest(false);
        const appointmentRequest = appointmentsRequests.find((request) => request.id === selectedRequestForReject);
        if (!appointmentRequest) {
            setShowError(true);
            setErrorMessage("Cererea de programare nu a fost găsită.")
            return;
        }
        console.log(appointmentRequest.patientCnp);

        try {
            await axios.post(
                baseUrl+`/api/admin/confirm-appointments/rejectAppointment`,
                {
                    appointmentRequestId: selectedRequestForReject,
                    patientCNP: appointmentRequest.patientCnp,
                    message: rejectMessage,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setConfirmAppBoxVisible(true)
            fetchAppointmentsRequests();
        } catch (error) {
            setShowError(true);
            setErrorMessage("Eroare la confirmarea cererii.")
            console.error("Eroare la confirmarea cererii:", error);
        }
    }

    const handleChange = (id, field, value) => {
        setConfirmData((prev) => ({
            ...prev,
            [id]: {
                ...(prev[id] || {}),
                [field]: value,
            },
        }));
    };

    const toggleSubmenu = (id) => {
        setVisibleSubmenu((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const handlePatientDetailsRedirect = (patientCnp) => {
        navigate(`/GeneralAdminBoard/specific-patient`, { state: { patientCnp } });
    };

    // Obținem data curentă și data maximă (peste 30 de zile)
    const getCurrentDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0]; // Formatăm ca YYYY-MM-DD
    };

    const getMaxDate = () => {
        const today = new Date();
        const maxDate = new Date(today.setDate(today.getDate() + 30)); // Adăugăm 30 de zile
        return maxDate.toISOString().split("T")[0]; // Formatăm ca YYYY-MM-DD
    };

    const closeErrorModal = ()=>{
        setShowError(false);
    }

    return (
        <div className={styles.page}>
            {infoConfirmAppBoxVisible && <InfoBox message={"Confirmarea a fost efectuata"} onClose={closeInfoConfirmAppBox}/>}
            {infoRejectAppBoxVisible && <InfoBox message={"Solicitarea a fost respinsă"} onClose={closeInfoRejectAppBox}/>}
            <h1 className={styles.titleAppReq}>Solicitări Programări</h1>
            {appointmentsRequests.length > 0 ? (
                <ul className={styles["requests"]}>
                    {appointmentsRequests.map((request) => (
                        <li className={styles["appointment_request"]} key={request.id}>
                            <p><strong>Motivul Programării:</strong> {request.appReason}</p>
                            <p><strong>Timpul Dorit:</strong> {request.appTime}</p>
                            <div>
                                <strong>Pacient:</strong>
                                <button className={styles.patient_link}
                                        onClick={() => handlePatientDetailsRedirect(request.patientCnp)}>
                                    {request.patientName}
                                </button>
                            </div>
                            <div className={styles.arrow_section}>
                                <p>{visibleSubmenu[request.id] ? "Mai puțin" : "Mai mult"}</p>
                                {visibleSubmenu[request.id] ? (
                                    <ChevronUpIcon
                                        className="h-6 w-6 text-cyan-600 cursor-pointer"
                                        onClick={() => toggleSubmenu(request.id)}
                                    />
                                ) : (
                                    <ChevronDownIcon
                                        className="h-6 w-6 text-cyan-600 cursor-pointer"
                                        onClick={() => toggleSubmenu(request.id)}
                                    />
                                )}
                            </div>
                            {visibleSubmenu[request.id] && (
                                <div className={styles.confirmForm}>
                                    <p className={styles.confirmTitle}>Confirmați programarea</p>
                                    <input
                                        type="date"
                                        required
                                        min={getCurrentDate()}
                                        max={getMaxDate()}
                                        onChange={(e) => handleChange(request.id, "date", e.target.value)}
                                    />
                                    <input
                                        type="time"
                                        required
                                        onChange={(e) => handleChange(request.id, "start_time", e.target.value)}
                                        placeholder="Ora de început"
                                    />
                                    <input
                                        type="time"
                                        required
                                        onChange={(e) => handleChange(request.id, "end_time", e.target.value)}
                                        placeholder="Ora de final"
                                    />
                                    <div className={styles.buttons}>
                                        <button className={styles.button} onClick={() => handleConfirm(request.id)}>
                                            Trimite Confirmarea
                                        </button>
                                        <button className={styles.button1} onClick={() => handleOpenConfirmRejectRequest(request.id)}>
                                            Respinge Solicitarea
                                        </button>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Nu există solicitări pentru programări.</p>
            )}
            <Dialog open={showError} onOpenChange={closeErrorModal}>
                <DialogContent className={styles.box}>
                    <p className={styles.changeRolT}>{errorMessage}</p>
                </DialogContent>
            </Dialog>
            <Dialog open={confirmRejectRequest} onOpenChange={handleCloseConfirmRejectRequest}>
                <DialogContent className={styles.box}>
                    <h2 className={styles.changeRolT}>Confirmare</h2>
                    <p className={styles.text}>
                        Ești sigur că dorești să respingi acestă solicitare?
                    </p>
                    <input
                        placeholder="Precizează intervale disponibile pentru pacient"
                        required
                        value={rejectMessage}
                        onChange={(e) => setRejectMessage(e.target.value)}
                    />
                    <button className={styles.actionButton} onClick={() => rejectRequest()}>
                        Da, respinge solicitare!
                    </button>
                    <button onClick={handleCloseConfirmRejectRequest}>Anulează!</button>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ConfirmAppointments;
