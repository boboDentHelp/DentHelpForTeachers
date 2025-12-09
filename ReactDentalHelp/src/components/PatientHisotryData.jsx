import PatientPersonalDataPage from "./PatientPersonalDataPage.jsx";
import GeneralAnamnesis from "./GeneralAnamnesis.jsx";
import { useState } from "react";
import "../assets/css/PatientHistory.css";
import PatientAppointmentsHistory from "./PatientAppointmentsHistory.jsx";
import styles from "../assets/css/PatientHistoryData.module.css"
import NavBar from "./NavBar.jsx";
import XrayPatient from "./XrayPatient.jsx";
import GeneralPatientBoard from "./GeneralPatientBoard.jsx";

function PatientHistoryData() {
    // Setează butonul activ la început
    const [activeComponent, setActiveComponent] = useState('A'); // Default este Componenta A

    // Funcția care afișează componenta corespunzătoare
    const renderComponent = () => {
        switch (activeComponent) {
            case 'A':
                return <PatientPersonalDataPage />;
            case 'B':
                return <GeneralAnamnesis />;
            case 'C':
                return <PatientAppointmentsHistory/>;
            case 'D':
                return <XrayPatient/>
            default:
                return <PatientPersonalDataPage />; // Componenta default
        }
    };

    return (
        <div className={styles["patient-history-container"]}>
            <NavBar></NavBar>
            <GeneralPatientBoard></GeneralPatientBoard>
            <div className={styles["components"]}>
                <div className={styles["slidebar"]}>
                    <button onClick={() => setActiveComponent('A')}
                            className={activeComponent === 'A' ? styles['active-component-button'] : styles['options-buttons']}>
                        Date Personale
                    </button>
                    <button onClick={() => setActiveComponent('B')}
                            className={activeComponent === 'B' ? styles['active-component-button'] : styles['options-buttons']}>
                        Anamneza Generală
                    </button>
                    <button onClick={() => setActiveComponent('C')}
                            className={activeComponent === 'C' ? styles['active-component-button'] : styles['options-buttons']}>
                        Programările mele
                    </button>
                    <button onClick={() => setActiveComponent('D')}
                            className={activeComponent === 'D' ? styles['active-component-button'] : styles['options-buttons']}>
                        Radiografii
                    </button>
                </div>
                <div className={styles["content"]}>
                    {renderComponent()}
                </div>
            </div>
        </div>
    );
}

export default PatientHistoryData;
