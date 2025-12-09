import stylesVertical from '../assets/css/VerticalMenu.module.css';
import {useNavigate, useParams} from "react-router-dom";
import NavBar from "./NavBar.jsx";
import pageStyle from "../assets/css/GeneralPatientBoardStyle.module.css"
import {useEffect, useState, useCallback, useRef} from "react";
import Scheduler from "./Scheduler.jsx";
import ConfirmAppointments from "./ConfirmAppointments.jsx";
import NotificationsAdmin from "./NotificationsAdmin.jsx";
import PatientsDoctor from "./PatientsDoctor.jsx";
import { useSpring, animated } from '@react-spring/web';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import moment from "moment";
import CabActivity from "./CabActivity.jsx";
import styles from "../assets/css/Scheduler.module.css";
import RegisterNewUser from "./RegisterNewUser.jsx";
import Consultant from "./Consultant.jsx";
import {
    Menu,
    Activity,
    UserPlus,
    Bell,
    Stethoscope
} from "lucide-react";
import { CalendarIcon, PersonIcon, FileTextIcon, FaceIcon, ExitIcon } from "@radix-ui/react-icons";
const GeneralPatientBoard = () => {
    const { component } = useParams();
    const [activeComponent, setActiveComponent] = useState(null);
    const [manualModalIsOpen, setManualModalIsOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatientCNP, setSelectedPatientCNP] = useState(''); // State for selected patient CNP
    const [appointmentReason, setAppointmentReason] = useState(null);


    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const [isSubmenuOpen, setIsSubmenuOpen] = useState({
        appointments: false,
    });
    const navigate = useNavigate();
    const externPatientCnp = location.state?.patientCnp;

    // Funcție pentru a obține componenta activă pe baza cheii
    const getActiveComponent = (key) => {
        switch (key) {
            case 'appointments':
                navigate("/GeneralAdminBoard/appointments", { replace: true });
                return <Scheduler/>;
            case "request":
                navigate("/GeneralAdminBoard/request", { replace: true });
                return <ConfirmAppointments/>;
            case "notifications":
                navigate("/GeneralAdminBoard/notifications", { replace: true });
                return <NotificationsAdmin/>
            case "patients":
                navigate("/GeneralAdminBoard/patients", { replace: true });
                return <PatientsDoctor/>;
            case "specific-patient":
                return <PatientsDoctor/>
            case "cab-activity":
                navigate("/GeneralAdminBoard/cab-activity", { replace: true });
                return <CabActivity/>
            case "register_people":
                navigate("/GeneralAdminBoard/register_people", { replace: true });
                return <RegisterNewUser/>
            case "addAppointment":
                openManualModal()
                navigate("/GeneralAdminBoard/appointments", { replace: true });
                return <Scheduler/>;
            case "consultant":
                navigate("/GeneralAdminBoard/consultant", { replace: true });
                return <Consultant></Consultant>
            default:
                return null;
        }
    };

    // Setează componenta activă pe baza parametru
    useEffect(() => {
        setActiveComponent(getActiveComponent(component));
    }, [component]);

    const handleLinkClick = (component) => {
        setActiveComponent(getActiveComponent(component));
    };

    // Funcție pentru a deschide/închide submenu-uri
    const toggleSubmenu = (menu) => {
        setIsSubmenuOpen((prevState) => ({
            ...prevState,
            [menu]: !prevState[menu],
        }));
    };

    const goToHomeSection = (sectionId) => {
        navigate(`/#${sectionId}`);
    };

    const [newAppointment, setNewAppointment] = useState({
        patient: '',
        start: null,
        end: null,
        appointmentReason: '',
    });

    const closeModal = () => {
        setManualModalIsOpen(false);
        setNewAppointment({
            patient: '',
            start: null,
            end: null,
            appointmentReason: '',
        });
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const openManualModal = () => {
        setNewAppointment({
            patient: '',
            start: null,
            end:null,
            appointmentReason: '',
        });
        setManualModalIsOpen(true);
    };

    const fetchPatients = async () =>{
        try{
            const token = localStorage.getItem("token");
            const response = await axios.get(baseUrl+'/api/admin/patient/get-patients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data.data;
            if (Array.isArray(data)) {
                const apiPatients = data.map((patient) => ({
                    patientFirstName: patient.firstName,
                    patientSecondName: patient.lastName,
                    patientCnp: patient.cnp
                }));
                console.log(data)
                setPatients(apiPatients); // Setează evenimentele preluate în starea `events`
            } else {
                console.error('Datele primite despre pacienti nu sunt un array:', data);
            }
        } catch (error) {
            console.error('Eroare la preluarea evenimentelor:', error);
        }
    };

    const addNewAppointment = async () => {

        try {
            const token = localStorage.getItem('token');
            const formattedStart = moment(newAppointment.start).format('DD/MM/YYYY HH:mm');
            const formattedEnd = moment(newAppointment.end).format('DD/MM/YYYY HH:mm');
            const response = await axios.post(
                baseUrl+"/api/admin/appointment/make-appointment",
                {
                    appointmentReason: appointmentReason,
                    patientCnp: selectedPatientCNP,
                    date: formattedStart,
                    hour: formattedEnd
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Trimite token-ul JWT în header-ul Authorization
                    },
                }
            );

            if (response.status === 200) {
                console.log(
                    "Programare salvata cu succes",
                    response.data
                );

            } else {
                alert("Eroare la salvarea programarii: " + response.statusText);
            }
        } catch (error) {
            console.error(
                "Eroare de la server:",
                error.response ? error.response.data : error.message
            );
            alert(
                "Eroare la salvarea programarii: " +
                (error.response ? error.response.data.message : error.message)
            );
        }
        closeModal();
    };

    useEffect(() => {
        fetchPatients();
    }, []);


    const [isMenuOpen, setIsMenuOpen] = useState(true);

    // React Spring menu toggle animation
    const menuSpring = useSpring({
        width: isMenuOpen ? 220 : 35,
        config: { tension: 250, friction: 30 }
    });

    // React Spring content entry animation
    const contentSpring = useSpring({
        opacity: 1,
        transform: 'translateY(0px)',
        from: { opacity: 0, transform: 'translateY(30px)' },
        config: { tension: 300, friction: 50 }
    });

    const toggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    const handleLogout = () =>{
        localStorage.removeItem("token")
        navigate('/')
    }

    return (
        <div className={pageStyle.container}>
            <animated.nav style={menuSpring} className={stylesVertical.menu}>
                <div className={stylesVertical["burger"]} onClick={toggleMenu}>
                    <Menu className={stylesVertical.hamburgerImg} />
                </div>
                <a href="/" className={stylesVertical["logo"]}>
                    <FaceIcon className={stylesVertical["logo"]} />
                    <p className={stylesVertical["logo-name"]}>DENT<br/>HELP</p>
                </a>
                <ul className={stylesVertical.menuItems}>
                    <li className={stylesVertical.menuItem}>
                        <Activity className={stylesVertical.verticalIcon}/>
                        <a onClick={() => handleLinkClick('cab-activity')}
                           className={stylesVertical.category}>Activitatea cabinetului</a>
                    </li>
                    <li>
                        <div className={stylesVertical.menuItem}>
                            <CalendarIcon className={stylesVertical.verticalIcon}/>
                            <a onClick={() => toggleSubmenu('appointments')} className={stylesVertical.category}>
                                Programări
                            </a>
                        </div>
                        {isSubmenuOpen.appointments && (
                            <ul className={stylesVertical.submenu}>
                                <li>
                                    <a onClick={() => handleLinkClick('appointments')}>Calendar programări</a>
                                </li>
                                <li>
                                    <a onClick={() => handleLinkClick('request')}>Solicitări programări</a>
                                </li>
                                <li>
                                    <a onClick={() => handleLinkClick('addAppointment')}>Adaugați programare</a>
                                </li>
                            </ul>
                        )}
                    </li>
                    <li className={stylesVertical.menuItem}>
                        <PersonIcon className={stylesVertical.verticalIcon}/>
                        <a onClick={() => handleLinkClick('patients')}
                           className={stylesVertical.category}>Pacienți</a>
                    </li>
                    <li className={stylesVertical.menuItem}>
                        <Bell className={stylesVertical.verticalIcon}/>
                        <a onClick={() => handleLinkClick('notifications')}
                           className={stylesVertical.category}>Notificări</a>
                    </li>
                    <li className={stylesVertical.menuItem}>
                        <UserPlus className={stylesVertical.verticalIcon}/>
                        <a onClick={() => handleLinkClick('register_people')}
                           className={stylesVertical.category}>Înregistrează utilizatori</a>
                    </li>
                    <li className={stylesVertical.menuItem}>
                        <Stethoscope className={stylesVertical.verticalIcon}/>
                        <a onClick={() => handleLinkClick('consultant')}
                           className={stylesVertical.category}>Consultant</a>
                    </li>
                </ul>
                <div className={stylesVertical.footerMenu}>
                    <ul>
                        <li className="flex items-center gap-2">
                            <button className={stylesVertical["footerMenuButtons"]}
                                    onClick={() => goToHomeSection('contact')}>Contact
                            </button>
                        </li>
                        <li className="flex items-center gap-2">
                            <button className={stylesVertical["footerMenuButtons"]}
                                    onClick={() => goToHomeSection('history')}>Despre noi
                            </button>
                        </li>
                        <li className="flex items-center gap-2">
                            <ExitIcon className="h-4 w-4" />
                            <button onClick={() => handleLogout()} className={stylesVertical["footerMenuButtons"]}>Deconectare</button>
                        </li>
                    </ul>
                </div>
            </animated.nav>
            <animated.div style={contentSpring} className={pageStyle.rightSide}>
                <NavBar></NavBar>
                {activeComponent}
            </animated.div>

            <Dialog open={manualModalIsOpen} onOpenChange={setManualModalIsOpen}>
                <DialogContent className={styles.modal}>
                    <DialogHeader>
                        <DialogTitle className={styles.addNewAppT}>Adaugă Programare</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="start-datetime">Data și ora de început</Label>
                            <Input
                                id="start-datetime"
                                type="datetime-local"
                                value={newAppointment.start ? moment(newAppointment.start, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DDTHH:mm') : ''}
                                onChange={(e) => {
                                    const date = e.target.value ? moment(e.target.value).format('DD/MM/YYYY HH:mm') : '';
                                    setNewAppointment({ ...newAppointment, start: date });
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-datetime">Data și ora de sfârșit</Label>
                            <Input
                                id="end-datetime"
                                type="datetime-local"
                                value={newAppointment.end ? moment(newAppointment.end, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DDTHH:mm') : ''}
                                onChange={(e) => {
                                    const date = e.target.value ? moment(e.target.value).format('DD/MM/YYYY HH:mm') : '';
                                    setNewAppointment({ ...newAppointment, end: date });
                                }}
                            />
                        </div>

                        <div>
                            <Label htmlFor="patient-select">Pacient</Label>
                            <Select
                                value={selectedPatientCNP}
                                onValueChange={(value) => {
                                    setSelectedPatientCNP(value);
                                    setNewAppointment({ ...newAppointment, patient: value });
                                }}
                            >
                                <SelectTrigger id="patient-select">
                                    <SelectValue placeholder="Selectează pacient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem key={patient.patientCnp} value={patient.patientCnp}>
                                            {`${patient.patientFirstName} ${patient.patientSecondName} (${patient.patientCnp})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className={styles["appointmentReason"]}>
                            <Label htmlFor="appointment-reason-select">Selectați motivul programării</Label>
                            <select
                                className={styles["appointment-reason-input"]}
                                id="appointment-reason-select"
                                required
                                value={appointmentReason}
                                onChange={(e) => setAppointmentReason(e.target.value)}
                            >
                                <option value="" disabled>
                                    Selectați motivul programării
                                </option>
                                <option value="consult">Consult</option>
                                <option value="igienizare">Igienizare Profesionala</option>
                                <option value="albire">Albire Profesionala</option>
                                <option value="durere-masea">Durere măsea</option>
                                <option value="control">Control</option>
                            </select>
                        </div>
                        <button
                            className={styles.addBtn}
                            onClick={addNewAppointment}
                        >Adaugă Programare
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default GeneralPatientBoard;
