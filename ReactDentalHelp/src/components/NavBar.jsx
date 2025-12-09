import styles from '../assets/css/NavBar.module.css';
import {isTokenValid} from "../service/authService.jsx";
import {useNavigate} from "react-router-dom";
import { useState } from "react";
import { animated } from '@react-spring/web';
import logo from "../assets/login_photo/tooth.png";

const Navbar = () => {
    const navigate = useNavigate();
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [logoHovered, setLogoHovered] = useState(false);

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        return token && isTokenValid(token);
    };

    const goToHomeSection = (sectionId) => {
        navigate(`/#${sectionId}`);
    };

    return (
        <nav className={styles["navbar"]}>
            <div className={styles["navbarContainer"]}>
                <div
                    className={styles["logoSection"]}
                    onClick={() => navigate('/')}
                    onMouseEnter={() => setLogoHovered(true)}
                    onMouseLeave={() => setLogoHovered(false)}
                    style={{
                        transform: logoHovered ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.2s ease'
                    }}
                >
                    <img src={logo} alt="DentHelp" className={styles["logoImg"]} />
                    <span className={styles["logoText"]}>
                        DENT<span className={styles["logoAccent"]}>HELP</span>
                    </span>
                </div>

                <div className={styles["navLinks"]}>
                    {isAuthenticated() ? (
                        <button
                            onClick={() => goToHomeSection("options-section")}
                            className={styles["navButton"]}
                            onMouseEnter={() => setHoveredIndex(0)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                transform: hoveredIndex === 0 ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0px)',
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            Menu
                        </button>
                    ) : (
                        <a
                            href="/login"
                            className={styles["navButton"]}
                            onMouseEnter={() => setHoveredIndex(0)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            style={{
                                transform: hoveredIndex === 0 ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0px)',
                                transition: 'transform 0.2s ease'
                            }}
                        >
                            Sign In
                        </a>
                    )}
                    <button
                        onClick={() => goToHomeSection('history')}
                        className={styles["navButton"]}
                        onMouseEnter={() => setHoveredIndex(1)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                            transform: hoveredIndex === 1 ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0px)',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        About Us
                    </button>
                    <button
                        onClick={() => goToHomeSection('contact')}
                        className={styles["navButton"]}
                        onMouseEnter={() => setHoveredIndex(2)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                            transform: hoveredIndex === 2 ? 'scale(1.05) translateY(-2px)' : 'scale(1) translateY(0px)',
                            transition: 'transform 0.2s ease'
                        }}
                    >
                        Contact
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
