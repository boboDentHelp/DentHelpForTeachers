import stylesVertical from '../assets/css/VerticalMenu.module.css';
import {useNavigate, useParams} from "react-router-dom";
import NavBar from "./NavBar.jsx";
import pageStyle from "../assets/css/GeneralPatientBoardStyle.module.css"
import {useEffect, useState} from "react";
import Scheduler from "./Scheduler.jsx";
import ConfirmAppointments from "./ConfirmAppointments.jsx";
import NotificationsAdmin from "./NotificationsAdmin.jsx";
import PatientsDoctor from "./PatientsDoctor.jsx";
import axios from "axios";
import CabActivity from "./CabActivity.jsx";
import styles from "../assets/css/Scheduler.module.css";
import RegisterNewUser from "./RegisterNewUser.jsx";
import PatientsForRadiologist from "./PatientsForRadiologist.jsx";
import { FaceIcon, PersonIcon, ExitIcon } from "@radix-ui/react-icons";
import { useSpring, animated } from '@react-spring/web';

const GeneralRadiologistBoard = () => {
    const { component } = useParams();
    const [activeComponent, setActiveComponent] = useState(null);
    const [patients, setPatients] = useState([]);
    const [selectedPatientCNP, setSelectedPatientCNP] = useState(''); // State for selected patient CNP
    const navigate = useNavigate();
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    const getActiveComponent = (key) => {
        switch (key) {
            case 'patientsXrays':
                navigate("/GeneralRadiologistBoard/patientsXrays", { replace: true });
                return <PatientsForRadiologist/>;
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


    const goToHomeSection = (sectionId) => {
        navigate(`/#${sectionId}`);
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


    useEffect(() => {
        fetchPatients();
    }, []);

    // React Spring content entry animation
    const contentSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(30px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        reset: true,
        config: { tension: 300, friction: 50 }
    });

    return (
        <div className={pageStyle.container}>
            <nav className={stylesVertical.menu}>
                <a href="/" className={stylesVertical["logo"]}>
                    <FaceIcon className={stylesVertical["logo"]} strokeWidth={2} />
                    <p className={stylesVertical["logo-name"]}>DENT<br/>HELP</p>
                </a>
                <ul className={stylesVertical.menuItems}>
                    <li>
                        <a onClick={() => handleLinkClick('patientsXrays')} className={stylesVertical.category}>
                            <div className={stylesVertical.menuItem}>
                                <PersonIcon className={stylesVertical.verticalIcon}/>
                                <span>Pacienți</span>
                            </div>
                        </a>
                    </li>
                </ul>
                <div className={stylesVertical.footerMenu}>
                    <ul>
                        <li><button className={stylesVertical["footerMenuButtons"]} onClick={() => goToHomeSection('contact')}>Contact</button></li>
                        <li><button className={stylesVertical["footerMenuButtons"]} onClick={() => goToHomeSection('history')}>Despre noi</button></li>
                        <li><button className={stylesVertical["footerMenuButtons"]} onClick={() => {localStorage.removeItem('token'); navigate('/')}}><ExitIcon className="w-4 h-4" /> Logout</button></li>
                    </ul>
                </div>
            </nav>
            <animated.div style={contentSpring} className={pageStyle["rightSide"]}>
                <NavBar></NavBar>
                {activeComponent}
            </animated.div>

        </div>
    );
};

export default GeneralRadiologistBoard;
