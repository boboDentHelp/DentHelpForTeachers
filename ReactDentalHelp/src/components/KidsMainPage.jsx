import styles from "../assets/css/KidsMainPage.module.css";
import kid_img from "../assets/kids_photos/12.png";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import {useState} from "react";

function KidsMainPage() {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/GeneralPatientBoard/register-kids", { replace: true });
    };

    return (
        <div className={styles.page}>
            <NavBar></NavBar>
            <div className={styles.page_content}>
                <div className={styles.textContent}>
                    <h1 className={styles.title}>
                            Înregistrați-vă copilul și gestionați totul dintr-un singur loc!
                    </h1>
                    <p className={styles.content}>
                            Pentru a face lucrurile mai simple și mai organizate, vă oferim posibilitatea să
                            gestionati programările și informațiile medicale ale copilului dumneavoastră
                            direct din contul personal. În doar câțiva pași simpli, puteți adăuga
                            profilul copilului, astfel încât să vă asigurați că primește îngrijirea
                            dentară de care are nevoie, fără bătăi de cap.
                        </p>
                    <h3 className={styles.finalWord}>
                        Împreună, facem îngrijirea dentară mai ușoară pentru dumneavoastră și
                        familia ta! 🦷✨
                    </h3>
                    <button onClick={handleClick} className={styles.addKidBtn}>
                            Înregistrați-vă copilul
                        </button>
                </div>
                <img className={styles.kidImg} src={kid_img} alt="Kid" />
            </div>
        </div>
    );
}

export default KidsMainPage;
