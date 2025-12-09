import stylesVertical from '../assets/css/VerticalMenu.module.css';
import RequestAppointment from "./RequestAppointment.jsx";
import PatientAppointmentsHistory from "./PatientAppointmentsHistory.jsx";
import XrayPatient from "./XrayPatient.jsx";
import GeneralAnamnesis from "./GeneralAnamnesis.jsx";
import PatientPersonalDataPage from "./PatientPersonalDataPage.jsx";
import KidsMainPage from "./KidsMainPage.jsx";
import {useNavigate, useParams} from "react-router-dom";
import NavBar from "./NavBar.jsx";
import pageStyle from "../assets/css/GeneralPatientBoardStyle.module.css"
import {useEffect, useState} from "react";
import HandleKidAccount from "./HandleKidAccount.jsx";
import CabServices from "./CabServices.jsx";
import GeneralDentalStatus from "./GeneralDentalStatus.jsx"
import PatientAppointmentRequests from "./PatientAppointmentRequests.jsx";
import PatientPersonalData from "./PatientPersonalData.jsx";
import { useSpring, animated } from '@react-spring/web';
import {
    Menu,
    User,
    Activity,
    Stethoscope
} from "lucide-react";
import { PersonIcon, CalendarIcon, FaceIcon, ExitIcon } from "@radix-ui/react-icons";

const GeneralPatientBoard = () => {

    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const { component } = useParams();
    const [activeComponent, setActiveComponent] = useState(null);
    const [isSubmenuOpen, setIsSubmenuOpen] = useState({
        requests: false,
        personal: false,
    });
    const navigate = useNavigate();

    const getActiveComponent = (key) => {
        switch (key) {
            case 'kids':
                navigate("/GeneralPatientBoard/kids", { replace: true });
                return <KidsMainPage />;
            case 'register-kids':
                return <HandleKidAccount />;
            case 'request':
                navigate("/GeneralPatientBoard/request", { replace: true });
                return <RequestAppointment />;
            case 'history':
                navigate("/GeneralPatientBoard/history", { replace: true });
                return <PatientAppointmentsHistory />;
            case 'status':
                navigate("/GeneralPatientBoard/status", { replace: true });
                return <GeneralDentalStatus/>
            case 'personal':
                navigate("/GeneralPatientBoard/personal", { replace: true });
                return <PatientPersonalData/>;
            case "cab-service":
                navigate("/GeneralPatientBoard/cab-service", { replace: true });
                return <CabServices/>
            case 'anamnesis':
                navigate("/GeneralPatientBoard/anamnesis", { replace: true });
                return <GeneralAnamnesis />;
            case 'xray':
                navigate("/GeneralPatientBoard/xray", { replace: true });
                return <XrayPatient />;
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
                <div className={stylesVertical.verticalItems}>
                    <div>
                        <a href="/" className={stylesVertical["logo"]}>
                            <FaceIcon className={stylesVertical["logo"]} />
                            <p className={stylesVertical["logo-name"]}>DENT<br/>HELP</p>
                        </a>
                        <ul className={stylesVertical.menuItems}>
                            <li >
                                <div className={stylesVertical.menuItem}>
                                    <CalendarIcon className={stylesVertical.verticalIcon}/>
                                    <a onClick={() => toggleSubmenu('requests')} className={stylesVertical.category}>
                                        Programări
                                    </a>
                                </div>
                                {isSubmenuOpen.requests && (
                                    <ul className={stylesVertical.submenu}>
                                        <li>
                                            <a onClick={() => handleLinkClick('request')}>Solicită o programare</a>
                                        </li>
                                        <li>
                                            <a onClick={() => handleLinkClick('history')}>Programările mele</a>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li >
                                <div className={stylesVertical.menuItem}>
                                    <User className={stylesVertical.verticalIcon}/>
                                    <a onClick={() => toggleSubmenu('personal')} className={stylesVertical.category}>
                                        Date personale
                                    </a>
                                </div>
                                {isSubmenuOpen.personal && (
                                    <ul className={stylesVertical.submenu}>
                                        <li>
                                            <a onClick={() => handleLinkClick('personal')}>Date personale</a>
                                        </li>
                                        <li>
                                            <a onClick={() => handleLinkClick('anamnesis')}>Anamneza generală</a>
                                        </li>
                                        <li>
                                            <a onClick={() => handleLinkClick('xray')}>Radiografii</a>
                                        </li>
                                        <li>
                                            <a onClick={() => handleLinkClick('status')}>Status dentar</a>
                                        </li>
                                    </ul>
                                )}
                            </li>
                            <li className={stylesVertical.menuItem}>
                                <PersonIcon className={stylesVertical.verticalIcon}/>
                                <a onClick={() => handleLinkClick('kids')} className={stylesVertical.category}>Copii</a>
                            </li>
                        </ul>
                    </div>
                    <div className={stylesVertical.footerMenu}>
                        <ul>
                            <li>
                                <button className={stylesVertical["footerMenuButtons"]}
                                        onClick={() => goToHomeSection('contact')}>Contact
                                </button>
                            </li>
                            <li>
                                <button className={stylesVertical["footerMenuButtons"]}
                                        onClick={() => goToHomeSection('history')}>Despre noi
                                </button>
                            </li>
                            <li>
                                <ExitIcon className="w-4 h-4" />
                                <button onClick={() => handleLogout()} className={stylesVertical["footerMenuButtons"]}>Deconectare
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </animated.nav>
            <animated.div style={contentSpring} className={pageStyle["rightSide"]}>
                {activeComponent}
            </animated.div>
        </div>
    );
};

export default GeneralPatientBoard;
