import styles from "../assets/css/NotificationsAdmin.module.css"
import {useEffect, useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import InfoBox from "./InfoBox.jsx";
import { ChevronUp, ChevronDown } from "lucide-react";
import { TrashIcon, EnvelopeClosedIcon, EnvelopeOpenIcon } from "@radix-ui/react-icons";

function NotificationsAdmin() {

    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const [patientNames, setPatientNames] = useState({});
    const [visibleSubmenu, setVisibleSubmenu] = useState({});
    const [infoReadMessageBoxVisible, setReadMessageInfoBoxVisible] = useState(false);
    const [infoDeleteMessageBoxVisible, setDeleteMessageInfoBoxVisible] = useState(false);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(baseUrl+`/api/in/notifications/admin/get_notifications`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200 && response.data.data != null) {
                console.log(response.data.data)
                if (Array.isArray(response.data.data)) {
                    setNotifications(response.data.data)
                } else {
                    console.error('Notifications data is not an array:', response.data.data);
                    setNotifications([]); // Set empty array as fallback
                }
            } else {
                setNotifications([]); // Set empty array if data is null
            }
        } catch (error) {
            console.error('Eroare la preluarea notificarilor', error);
            setNotifications([]); // Set empty array on error
        }
    };

    const deleteNotification = async (notificationId) =>{
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(baseUrl+`/api/in/notifications/admin/delete_notification/${notificationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setDeleteMessageInfoBoxVisible(true)
                fetchNotifications()
            }
        } catch (error) {
            console.error('Eroare la stergerea notificarii', error);
        }
    }

    const readNotification = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                baseUrl+`/api/in/notifications/admin/read_notification/${notificationId}`,
                {}, // trimitem un obiect gol pentru că datele sunt transmise prin URL
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setReadMessageInfoBoxVisible(true)
                fetchNotifications();
            }
        } catch (error) {
            console.error('Eroare la cititrea notificarii', error);
        }
    };


    const fetchPatientByCnp = async (patientCnp) => {
        try {
            console.log(patientCnp);
            const response = await axios.get(
                baseUrl+`/api/admin/patient/get-patient-personal-data/${patientCnp}`,
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
            return "Pacient neidentificat"
        }
    };

    useEffect(() => {
        fetchNotifications()
    }, []);

    useEffect(() => {
        // Pentru fiecare notificare, preia numele pacientului
        const fetchPatientNames = async () => {
            const newPatientNames = {};
            for (const notification of notifications) {
                const patientName = await fetchPatientByCnp(notification.patientCnp);
                newPatientNames[notification.patientCnp] = patientName; // Asociază numele pacientului cu CNP-ul
            }
            setPatientNames(newPatientNames); // Actualizează starea cu numele pacienților
        };

        if (notifications.length > 0) {
            fetchPatientNames();
        }
    }, [notifications]); // Rulam efectul doar când `notifications` se schimbă


    const handlePatientDetailsRedirect = (patientCnp) => {
        navigate(`/GeneralAdminBoard/specific-patient`, { state: { patientCnp } });
    };


    const toggleSubmenu = (id) => {
        setVisibleSubmenu((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const extractHourFromTimeString = (time) =>{
        const [date, hour] = time.split(" ");
        return hour
    }
    const extractDateFromTimeString = (time) =>{
        const [date, hour] = time.split(" ");
        return date
    }

    const closeInfoReadMessageBox = () => {
        setReadMessageInfoBoxVisible(false);
    };

    const closeInfoDeleteMessageBox = () => {
        setDeleteMessageInfoBoxVisible(false);
    };
    return (
        <div>
            <h1 className={styles.titleNot}>NOTIFICĂRI</h1>
            {infoReadMessageBoxVisible && <InfoBox message={"Statusul notificării a fost schimbat"} onClose={closeInfoReadMessageBox}/>}
            {infoDeleteMessageBoxVisible && <InfoBox message={"Notificarea a fost ștearsă"} onClose={closeInfoDeleteMessageBox}/>}

            {notifications.length > 0 ? (
                <ul className={styles['notifications']}>
                    {notifications.map((notification) => (
                        <li
                            className={`${styles["notification"]} ${
                                notification.notificationStatus === "NEW" ? styles["unreadNotification"] : styles["readNotification"]
                            }`}
                            key={notification.notificationId}
                        >
                            <div className={styles["header_notifications"]}>
                                <div className={styles["tex_and_arrow"]}>
                                    <h3 className={styles["notification_title"]}>
                                        {notification.notificationType === "CANCEL_APPOINTMENT" ? "PROGRAMARE ANULATĂ" : "ÎNTÂRZIERE PROGRAMARE"}
                                    </h3>
                                    {visibleSubmenu[notification.notificationId] ? (
                                        <ChevronUp
                                            className="h-6 w-6 text-cyan-600 cursor-pointer"
                                            onClick={() => toggleSubmenu(notification.notificationId)}
                                        />
                                    ) : (
                                        <ChevronDown
                                            className="h-6 w-6 text-cyan-600 cursor-pointer"
                                            onClick={() => toggleSubmenu(notification.notificationId)}
                                        />
                                    )}
                                </div>
                                <div className={styles["date_and_time"]}>
                                    <p className={styles["date_time_text"]}>Ora:{extractHourFromTimeString(notification.date)}</p>
                                    <p className={styles["date_time_text"]}>Data:{extractDateFromTimeString(notification.date)}</p>
                                </div>
                                <div className={styles["icons"]}>
                                    <div className={styles["trash_icon_container"]}>
                                        <TrashIcon
                                            onClick={() => deleteNotification(notification.notificationId)}
                                            className="h-5 w-5 text-cyan-600 cursor-pointer"
                                        />
                                        <span className={styles["tooltip"]}>Șterge notificarea</span>
                                    </div>
                                    <div className={styles["trash_icon_container"]}>
                                        {notification.notificationStatus === "NEW" ? (
                                            <EnvelopeClosedIcon
                                                onClick={() => readNotification(notification.notificationId)}
                                                className="h-5 w-5 text-cyan-600 cursor-pointer"
                                            />
                                        ) : (
                                            <EnvelopeOpenIcon
                                                onClick={() => readNotification(notification.notificationId)}
                                                className="h-5 w-5 text-cyan-600 cursor-pointer"
                                            />
                                        )}
                                        <span className={styles["tooltip"]}>
                            {notification.notificationStatus === "NEW" ? "Marchează ca citit" : "Marchează ca necitit"}
                        </span>
                                    </div>
                                </div>
                            </div>

                            {visibleSubmenu[notification.notificationId] && (
                                <div className={styles["details_content"]}>
                                    <p>
                                        Pacient:
                                        <button
                                            className={styles["patient_link"]}
                                            onClick={() => handlePatientDetailsRedirect(notification.patientCnp)}
                                        >
                                            {patientNames[notification.patientCnp]}
                                        </button>
                                    </p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>

            ) : (
                <p>Nu există notificari</p>
            )}
        </div>
    )
}


export default NotificationsAdmin