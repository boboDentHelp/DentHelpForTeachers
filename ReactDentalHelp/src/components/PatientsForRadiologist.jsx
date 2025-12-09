import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../assets/css/PatientsDoctor.module.css';
import user_photo from '../assets/patients_photo/user.png';
import PatientPersonalData from "../components/PatientsDoctorComponents/PatientPersonalData.jsx";
import PatientAppointmentsForDoctor from "./PatientsDoctorComponents/PatientAppointmentsForDoctor.jsx";
import PatientRadiography from "./PatientsDoctorComponents/PatientRadiography.jsx";
import PatientStatus from "./PatientsDoctorComponents/PatientStatus.jsx";
import PatientGeneralAnamnesis from "./PatientsDoctorComponents/PatientGeneralAnamnesis.jsx";
import {useLocation} from "react-router-dom";
import NavBar from "./NavBar.jsx";

function PatientsDoctor() {
    const [patients, setPatients] = useState([]);
    const [selectedPatientCnp, setSelectedPatientCnp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(baseUrl+'/api/admin/patient/get-patients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPatients(response.data.data); // Assuming response.data contains an array of patients
        } catch (error) {
            console.error('Error fetching patients', error);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    const handlePatientSelect = (cnp) => {
        setSelectedPatientCnp(cnp);  // Select new patient
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (

        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.sidebar}>
                    <div className={styles["searchContainer"]}>
                        <input
                            type="text"
                            placeholder="Caută pacient..."
                            className={styles["searchInput"]}
                            value={searchTerm}
                            onChange={handleSearch} //
                        />
                    </div>
                    <div className={styles.patientList}>
                        {filteredPatients.map((patient) => (
                            <div
                                key={patient.id}
                                className={`${styles.patientCard} ${selectedPatientCnp === patient.cnp ? styles.selectedPatient : ''}`}
                                onClick={() => handlePatientSelect(patient.cnp)} // Select patient on click
                            >
                                <img
                                    src={user_photo}
                                    alt={`${patient.firstName} ${patient.lastName}`}
                                    className={styles.patientPhoto}
                                />
                                <p>{`${patient.firstName} ${patient.lastName}`}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.rightPanel}>
                    {!selectedPatientCnp ? (
                        <p>Selectează un pacient pentru a vedea detaliile acestuia.</p>
                        ):(
                        <PatientRadiography cnp={selectedPatientCnp} />
                        )}
                </div>
            </div>
        </div>
    );
}

export default PatientsDoctor;