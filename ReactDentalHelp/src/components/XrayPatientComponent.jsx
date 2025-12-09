import {useEffect, useState} from "react";
import axios from "axios";
import styles from "../assets/css/PatientRadiography.module.css";
import radiographyPhoto from "../assets/radiography_photo/radiography.png";
import {jwtDecode} from "jwt-decode";
import NavBar from "./NavBar.jsx";

function XrayPatientComponent(props) {
    const [radiographs, setRadiographs] = useState([]);
    const [selectedRadiograph, setSelectedRadiograph] = useState(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Stare pentru modal imagine
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const getPatientRadiographies = async () => {
        try {
            const token = localStorage.getItem('token');
            const decodedToken = jwtDecode(token)
            let patientCnp = decodedToken.cnp;
            if(props.cnp!=null)
                patientCnp = props.cnp;

            const response = await axios.get(
                baseUrl+`/api/patient/xray/get-patient-xrays/${patientCnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                const data = response.data.data;
                console.log(data)
                setRadiographs(data);
            }
        } catch (error) {
            console.error('Eroare la preluarea radiografiilor pacientului', error);
        }
    };

    useEffect(() => {
        getPatientRadiographies();
    }, []);

    const handleRadiographClick = (radiograph) => {
        setSelectedRadiograph(radiograph);
    };


    const getImageUrl = (filePath) => {
        console.log(filePath)
        return filePath.startsWith('http')
            ? filePath  // URL extern, îl folosim direct
            : `http://localhost:5173/${filePath}`;  // URL local, adaugă domeniul serverului tău
    };

    const openImageModal = () => {
        setIsImageModalOpen(true); // Deschide modalul pentru imagine
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false); // Închide modalul pentru imagine
    };

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                <div className={styles.leftSide}>
                    <p className={styles.xray_title}>Radiografiile tale</p>
                    <div className={styles.radiographsList}>
                        {radiographs.length > 0 ? (
                            radiographs.map((radiograph) => (
                                <div
                                    key={radiograph.xrayId}
                                    className={styles.radiographItem}
                                    onClick={() => handleRadiographClick(radiograph)}
                                >
                                    <img
                                        src={radiographyPhoto}
                                        alt={`Radiografia din ${radiograph.date}`}
                                        className={styles["radiographImage"]}
                                    />
                                    <p className={styles.radiographDate}>Data: {radiograph.date}</p>
                                </div>
                            ))
                        ) : (
                            <p className={styles.noXray}>Momentan nu ai nici o radiografie.</p>
                        )}
                    </div>
                </div>

                <div className={styles.rightSide}>
                    {selectedRadiograph ? (
                        <div className={styles.radiographDetails}>
                            <p className={styles.detXray}>Detalii Radiografie</p>
                            <img
                                src={getImageUrl(selectedRadiograph.filePath)}
                                alt={`Radiografia din ${selectedRadiograph.date}`}
                                className={styles.radiographImage}
                                onClick={openImageModal}
                            />
                            <p><strong>Data:</strong> {selectedRadiograph.date}</p>
                            <p><strong>Observații:</strong> {selectedRadiograph.observations || 'Nicio observație disponibilă'}</p>
                        </div>
                    ) : (
                        <p>Selectează o radiografie pentru a vedea detaliile.</p>
                    )}
                </div>


                {/* Modal pentru afișarea imaginii mărite */}
                {isImageModalOpen && (
                    <div className={styles.modal} onClick={closeImageModal}>
                        <div className={styles.modalContent}>
                            <span className={styles.closeButton} onClick={closeImageModal}>&times;</span>
                            <img
                                src={selectedRadiograph.filePath || radiographyPhoto}
                                alt={`Radiografia din ${selectedRadiograph.date}`}
                                className={styles.largeRadiographImage}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


export default XrayPatientComponent;