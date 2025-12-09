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
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPatientCnp, setSelectedPatientCnp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const location = useLocation();
    const externPatientCnp = location.state?.patientCnp;
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    // Fetch patients from the API
    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(baseUrl+'/api/admin/patient/get-patients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            // Validate that response.data.data is an array before setting
            if (response.data && Array.isArray(response.data.data)) {
                setPatients(response.data.data);
                console.log('Patients fetched successfully:', response.data.data);
            } else {
                console.error('Invalid patient data format:', response.data);
                setPatients([]); // Set empty array as fallback
            }
        } catch (error) {
            console.error('Error fetching patients', error);
            setPatients([]); // Set empty array on error to prevent crashes
        }
    };

    useEffect(() => {
        fetchPatients();
        if(externPatientCnp)
        {
            handlePatientSelect(externPatientCnp)
            setActiveTab(0)
        }
    }, []);



    const renderTabContent = () => {
        if (!selectedPatientCnp) {
            return <p>Selectează un pacient pentru a vedea detaliile acestuia.</p>;
        }

        switch (activeTab) {
            case 0:
                return <PatientPersonalData cnp={selectedPatientCnp} />;
            case 1:
                return <PatientGeneralAnamnesis cnp={selectedPatientCnp} />;
            case 2:
                return <PatientAppointmentsForDoctor cnp={selectedPatientCnp} />;
            case 3:
                return <PatientRadiography cnp={selectedPatientCnp} />;
            case 4:
                return <PatientStatus cnp={selectedPatientCnp} />;
            default:
                return null;
        }
    };



    const handlePatientSelect = (cnp) => {
        setSelectedPatientCnp(cnp);  // Select new patient
        //setActiveTab(0);
    };

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const filteredPatients = patients.filter(patient =>
        `${patient.firstName || ''} ${patient.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (

        <div className={styles.container}>
            <div className={styles.sidebar}>
                <div className={styles["searchContainer"]}>
                    <input
                        type="text"
                        placeholder="Caută pacient..."
                        className={styles["searchInput"]}
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <div className={styles.patientList}>
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map((patient) => (
                            <div
                                key={patient.cnp || patient.id}
                                className={`${styles.patientCard} ${selectedPatientCnp === patient.cnp ? styles.selectedPatient : ''}`}
                                onClick={() => handlePatientSelect(patient.cnp)} // Select patient on click
                            >
                                <img
                                    src={user_photo}
                                    alt={`${patient.firstName || 'Unknown'} ${patient.lastName || 'Patient'}`}
                                    className={styles.patientPhoto}
                                />
                                <p>{`${patient.firstName || 'Unknown'} ${patient.lastName || 'Patient'}`}</p>
                            </div>
                        ))
                    ) : (
                        <p>No patients found.</p>
                    )}
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.tabButtons}>
                    <button
                        className={`${styles.tabButton} ${activeTab === 0 ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(0)}
                    >Date personale
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 1 ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(1)}
                    >Anamneza generală
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 2 ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(2)}
                    >Programările pacientului
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 3 ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(3)}
                    >Radiografii
                    </button>
                    <button
                        className={`${styles.tabButton} ${activeTab === 4 ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(4)}
                    >Status
                    </button>
                </div>
                <div className={styles.tabContent}>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
}

export default PatientsDoctor;