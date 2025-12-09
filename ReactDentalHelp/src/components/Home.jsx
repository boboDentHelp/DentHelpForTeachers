import {useLocation, useNavigate} from "react-router-dom";
import styles from "../assets/css/Home.module.css";
import { isTokenValid, parseJwt } from "../service/authService.jsx";
import NavBar from "./NavBar.jsx";
import { toast } from "sonner";
import first_img from "../assets/home_photo/1.png";
import stain from "../assets/home_photo/pata.png";
import appointmentCardPic from "../assets/cards_photos/appointment.png";
import medicalHistoryCardPic from "../assets/cards_photos/health-report.png";
import kidsCardPic from "../assets/cards_photos/kids.png";
import stylesCard from "../assets/css/PatientMainPage.module.css";
import ortoPic from "../assets/home_photo/orto.png"
import patients from "../assets/cards_photos/patients.png";
import kids from "../assets/home_photo/kids-service.png"
import consultPic from "../assets/home_photo/general-consult.png"
import esteticaPic from "../assets/home_photo/estetica.png"
import medic from "../assets/home_photo/medic.png"
import xray from "../assets/radiography_photo/x-ray.png"
import {useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, FileTextIcon, PersonIcon, MobileIcon, DrawingPinIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { useSpring, useTrail, animated } from '@react-spring/web';

function Home() {
    const navigate = useNavigate();

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return token && isTokenValid(token);
    };

    const getUserRole = () => {
        const token = localStorage.getItem('token');
        if (token) {
            const decodedToken = parseJwt(token);
            return decodedToken.role;
        }
        return null;
    };

    const handleAppointmentClick = () => {
        if (isAuthenticated()) {
            const token = localStorage.getItem('token');
            const decodedToken = parseJwt(token);
            if (decodedToken.role === "PATIENT") {
                navigate("/GeneralPatientBoard/request");
            } else if (decodedToken.role === "ADMIN"){
                navigate("/GeneralAdminBoard/appointments");
            }else{
                navigate("/GeneralRadiologistBoard/patientsXrays");
            }
        } else {
            navigate("/Login");
        }
    };

    const handleClickPersonalData = () => {
        if (isAuthenticated()) {
            navigate("/GeneralPatientBoard/personal");
        }
        else{
            toast.error("Authentication required", {
                description: "You must be authenticated to access this section"
            });
        }
    };

    const handleClickKids = () => {
        if (isAuthenticated()) {
            navigate("/GeneralPatientBoard/kids");
        }
        else{
            toast.error("Authentication required", {
                description: "You must be authenticated to access this section"
            });
        }
    };


    const handleRequestAppointment = () => {
        if (isAuthenticated()) {
            navigate("/GeneralPatientBoard/request");
        }
        else{
            toast.error("Authentication required", {
                description: "You must be authenticated to access this section"
            });
        }
    };

    const handleAppointments = () => {
        if (isAuthenticated()){
            navigate("/GeneralAdminBoard/appointments");
        } else{
            toast.error("Authentication required", {
                description: "You must be authenticated to access this section"
            });
        }
    };

    const handlePatients = () => {
        if (isAuthenticated()){
            navigate("/GeneralAdminBoard/patients");
        }
        else{
            toast.error("Authentication required", {
                description: "You must be authenticated to access this section"
            });
        }
    };

    const handlePatientXrays = () => {
        if (isAuthenticated()){
            navigate("/GeneralRadiologistBoard/patientsXrays");
        }
        else{
            toast.error("Authentication required", {
                description: "You must be authenticated to access this section"
            });
        }
    };

    const handlePatientAccount = () => {
        if (isAuthenticated()){
            navigate("/GeneralRadiologistBoard/account");
        }
        else{
            toast.error("Authentication required", {
                description: "You must be authenticated to access this section"
            });
        }
    }

    const isLoggedIn = isAuthenticated();
    const userRole = getUserRole();

    const location = useLocation();

    useEffect(() => {
        if (location.hash) {
            const sectionId = location.hash.replace('#', '');
            const element = document.getElementById(sectionId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location]);

    // React Spring Animations - ALL INSTANT, NO SCROLL REQUIRED - OPTIMIZED FOR SPEED
    const titleSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(50px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        config: { tension: 300, friction: 50 }
    });

    const subtitleSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(30px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        delay: 100,
        config: { tension: 300, friction: 50 }
    });

    const propositionSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(30px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        delay: 200,
        config: { tension: 300, friction: 50 }
    });

    const buttonSpring = useSpring({
        from: { opacity: 0, transform: 'scale(0.8)' },
        to: { opacity: 1, transform: 'scale(1)' },
        delay: 300,
        config: { tension: 350, friction: 10 }
    });

    const imageSpring = useSpring({
        from: { opacity: 0, transform: 'translateX(100px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
        delay: 200,
        config: { tension: 300, friction: 50 }
    });

    const stainSpring = useSpring({
        from: { opacity: 0, transform: 'scale(0) rotate(180deg)' },
        to: { opacity: 1, transform: 'scale(1) rotate(0deg)' },
        delay: 400,
        config: { tension: 250, friction: 20 }
    });

    const cards = userRole === "PATIENT" ? [
        { title: "Request Appointment", description: "Book an appointment quickly and easily.", icon: CalendarIcon, onClick: handleRequestAppointment },
        { title: "History & Personal Data", description: "Access your medical history and personal data.", icon: FileTextIcon, onClick: handleClickPersonalData },
        { title: "Children", description: "Manage appointments and medical information for your children.", icon: PersonIcon, onClick: handleClickKids }
    ] : userRole === "ADMIN" ? [
        { title: "Appointments", description: "Manage all patient appointments.", icon: CalendarIcon, onClick: handleAppointments },
        { title: "Patients", description: "View and manage patient records.", icon: PersonIcon, onClick: handlePatients }
    ] : [];

    // Cards animate immediately after hero (delay: 500ms) - FASTER
    const cardTrail = useTrail(cards.length, {
        from: { opacity: 0, transform: 'translateY(50px) scale(0.95)' },
        to: { opacity: 1, transform: 'translateY(0px) scale(1)' },
        delay: 500,
        config: { tension: 320, friction: 50 }
    });

    const services = [
        { title: "Orthodontics", description: "Straighten your teeth for a perfect smile.", image: ortoPic },
        { title: "Pediatric Dentistry", description: "Specialized care for children's oral health.", image: kids },
        { title: "General Consultation", description: "Comprehensive dental examinations.", image: consultPic },
        { title: "Cosmetic Dentistry", description: "Enhance the beauty of your smile.", image: esteticaPic },
        { title: "Radiology", description: "Advanced dental imaging services.", image: xray },
        { title: "Expert Team", description: "Highly qualified dental professionals.", image: medic }
    ];

    // Services animate after cards (delay: 600ms) - FASTER
    const serviceTrail = useTrail(services.length, {
        from: { opacity: 0, transform: 'translateY(50px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        delay: 600,
        config: { tension: 320, friction: 50 }
    });

    // History section animates (delay: 700ms) - FASTER
    const historySpring = useSpring({
        from: { opacity: 0, transform: 'translateX(-50px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
        delay: 700,
        config: { tension: 300, friction: 50 }
    });

    // Contact section animates (delay: 800ms) - FASTER
    const contactSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(50px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        delay: 800,
        config: { tension: 300, friction: 50 }
    });

    return (
        <div className={styles.page}>
            <NavBar/>
            <div className={styles["content-container"]}>
                <div className={styles["text-content"]}>
                    <animated.h1 style={titleSpring} className={styles.title}>DENTHELP</animated.h1>
                    <animated.p style={subtitleSpring} className={styles.subtitle}>
                        Whether you're here for a routine checkup or a complete transformation,<br/> we're
                        here to help you achieve the smile of your dreams.
                    </animated.p>
                    <animated.p style={propositionSpring} className={styles.proposition}>Your smile, <br/> our passion</animated.p>
                    <animated.div style={buttonSpring}>
                        <Button
                            onClick={handleAppointmentClick}
                            size="lg"
                            className={`${styles["appointment-button"]} bg-primary hover:bg-primary/90`}
                        >
                            <CalendarIcon className="mr-2 h-5 w-5" />
                            Request Appointment
                        </Button>
                    </animated.div>
                </div>
                <div className={styles["right-images"]}>
                    <animated.img style={imageSpring} src={first_img} className={styles["right-image"]} alt="Right Image"/>
                    <animated.img style={stainSpring} src={stain} className={styles["stain-image"]} alt="Spot Image"/>
                </div>
            </div>

            {/* Display cards for patient users */}
            {(userRole === "PATIENT" || userRole === "ADMIN") && (
                <div className={styles.section} id="options-section">
                    <h2 className={styles["title-options"]}>Your Options</h2>
                    <p className={styles["intro-options"]}>
                        {userRole === "PATIENT"
                            ? "Welcome to \"Your Options\" section! Here you'll find everything you need to manage your appointments, access medical history, and manage personal information. Explore our features and choose what suits you best!"
                            : "Welcome to \"Your Options\" section! Here you'll find everything you need to manage patient appointments and monitoring."
                        }
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
                        {cardTrail.map((style, index) => {
                            const IconComponent = cards[index].icon;
                            return (
                                <animated.div key={index} style={style}>
                                    <Card
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={cards[index].onClick}
                                    >
                                        <CardHeader>
                                            <div className="flex justify-center mb-4">
                                                {IconComponent && <IconComponent className="h-16 w-16 text-cyan-600" />}
                                            </div>
                                            <CardTitle className="text-center">{cards[index].title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CardDescription className="text-center">
                                                {cards[index].description}
                                            </CardDescription>
                                        </CardContent>
                                    </Card>
                                </animated.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Services Section */}
            <div className={styles["services-section"]}>
                <h2 className={styles["services-title"]}>Our Services</h2>
                <p className={styles["services-description"]}>
                    We offer a wide range of dental services to meet all your oral health needs.
                </p>
                <div className={styles["services-grid"]}>
                    {serviceTrail.map((style, index) => (
                        <animated.div key={index} style={style} className={styles["service-card"]}>
                            <img src={services[index].image} alt={services[index].title} className={styles["service-image"]} />
                            <h3 className={styles["service-title"]}>{services[index].title}</h3>
                            <p className={styles["service-description"]}>{services[index].description}</p>
                        </animated.div>
                    ))}
                </div>
            </div>

            {/* History Section */}
            <animated.div style={historySpring} id="history" className={styles["history-section"]}>
                <h2 className={styles["history-title"]}>About Us</h2>
                <div className={styles["history-content"]}>
                    <div className={styles["history-text"]}>
                        <p className={styles["history-description"]}>
                            With over 20 years of experience in dentistry, our clinic has become a trusted name
                            in oral health care. We combine modern technology with personalized care to ensure
                            the best outcomes for our patients.
                        </p>
                        <p className={styles["history-description"]}>
                            Our team of specialists is dedicated to providing comprehensive dental services in a
                            comfortable and welcoming environment. From routine checkups to complex procedures,
                            we're here to help you achieve and maintain optimal oral health.
                        </p>
                    </div>
                    <div className={styles["history-images"]}>
                        <div className={styles["history-image-grid"]}>
                            <img src={medic} alt="Our Team" className={styles["history-image"]} />
                            <img src={patients} alt="Happy Patients" className={styles["history-image"]} />
                        </div>
                    </div>
                </div>
            </animated.div>

            {/* Contact Section */}
            <animated.div style={contactSpring} id="contact" className={styles["contact-section"]}>
                <h2 className={styles["contact-title"]}>Contact Us</h2>
                <p className={styles["contact-description"]}>
                    We are here to answer your questions and help you with any information you need.
                    Don't hesitate to contact us using the details below.
                </p>

                <div className={styles["contact-info"]}>
                    <div className={styles["contact-item"]}>
                        <h3 className={`${styles["contact-item-title"]} flex items-center gap-2`}>
                            <DrawingPinIcon className="h-5 w-5 text-cyan-600" />
                            Address:
                        </h3>
                        <p className={styles["contact-item-text"]}>Example Street, No. 10, Bucharest, Romania</p>
                    </div>
                    <div className={styles["contact-item"]}>
                        <h3 className={`${styles["contact-item-title"]} flex items-center gap-2`}>
                            <MobileIcon className="h-5 w-5 text-cyan-600" />
                            Phone:
                        </h3>
                        <p className={styles["contact-item-text"]}>+40 123 456 789</p>
                    </div>
                    <div className={styles["contact-item"]}>
                        <h3 className={`${styles["contact-item-title"]} flex items-center gap-2`}>
                            <EnvelopeClosedIcon className="h-5 w-5 text-cyan-600" />
                            Email:
                        </h3>
                        <p className={styles["contact-item-text"]}>contact@cabinetdentist.ro</p>
                    </div>
                </div>
            </animated.div>
        </div>
    );
}

export default Home;
