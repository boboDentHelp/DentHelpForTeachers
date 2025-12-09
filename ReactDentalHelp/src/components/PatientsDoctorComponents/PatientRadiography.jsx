import { useEffect, useState } from 'react';
import axios from 'axios';
import styles from '../../assets/css/PatientRadiography.module.css';
import radiographyPhoto from "../../assets/radiography_photo/radiography.png";
import InfoBox from "../InfoBox.jsx";

function PatientRadiography(props) {
    const [radiographs, setRadiographs] = useState([]);
    const [selectedRadiograph, setSelectedRadiograph] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for add modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
    const [isImageModalOpen, setIsImageModalOpen] = useState(false); // Stare pentru modal imagine
    const [isInfoBoxVisible, setInfoBoxVisible] = useState(false);
    const [isInfoAddNewBoxVisible, setInfoAddNewBoxVisible] = useState(false);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const [newRadiograph, setNewRadiograph] = useState({
        date: '',
        observations: '',
        file: null,
    });
    const [editRadiograph, setEditRadiograph] = useState({
        observations: '',
        file: null,
    });

    const getPatientRadiographies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                baseUrl+`/api/patient/xray/get-patient-xrays/${props.cnp}`,
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
    }, [props.cnp]);

    const handleRadiographClick = (radiograph) => {
        setSelectedRadiograph(radiograph);
    };

    const openAddModal = () => {
        setIsAddModalOpen(true);
    };

    const closeAddModal = () => {
        setIsAddModalOpen(false);
    };

    const openEditModal = (radiograph) => {
        setEditRadiograph({
            observations: radiograph.observations,
            file: radiograph.file,
        });
        setSelectedRadiograph(radiograph);
        setIsEditModalOpen(true);
    };


    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleFileChange = (e, isEdit = false) => {
        if (isEdit) {
            setEditRadiograph({ ...editRadiograph, file: e.target.files[0] });
        } else {
            setNewRadiograph({ ...newRadiograph, file: e.target.files[0] });
        }
    };

    const handleInputChange = (e, isEdit = false) => {
        const { name, value } = e.target;
        if (isEdit) {
            setEditRadiograph({ ...editRadiograph, [name]: value });
        } else {
            setNewRadiograph({ ...newRadiograph, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('date', new Date().toISOString().split('T')[0]);
            formData.append('observations', newRadiograph.observations);
            formData.append('cnpPatient', props.cnp);
            formData.append('file', newRadiograph.file); // Adăugăm fișierul

            const response = await axios.post(
                baseUrl+`/api/patient/xray/save-xray`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    },
                }
            );

            if (response.status === 200) {
                closeAddModal();
                setNewRadiograph({
                    observations: '',
                    file: null
                });
                getPatientRadiographies();
                setInfoAddNewBoxVisible("true");
            }
        } catch (error) {
            console.error('Eroare la adăugarea radiografiei', error);
        }
    };


    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('observations', editRadiograph.observations || selectedRadiograph.observations);
            if (editRadiograph.file) {
                formData.append('file', editRadiograph.file);
            }

            const response = await axios.put(
                baseUrl+`/api/patient/xray/update-xray/${selectedRadiograph.xrayId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',  // Important pentru încărcarea fișierului
                    },
                }
            );

            if (response.status === 200) {
                closeEditModal();
                await getPatientRadiographies();
                setSelectedRadiograph(null)
                setInfoBoxVisible(true);

            }

        } catch (error) {
            console.error('Eroare la actualizarea radiografiei', error);
        }
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

    const closeInfoBox = () => {
        setInfoBoxVisible(false);
    };
    const closeInfoAddNewBox = () => {
        setInfoAddNewBoxVisible(false);
    };
    return (
        <div className={styles.container}>
            <div className={styles.leftSide}>
                <p className={styles["xrTitle"]}>Radiografiile pacientului</p>
                <div className={styles["radiographsList"]}>
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
                        <p>Nici o radiografie disponibilă</p>
                    )}
                </div>

                {/* Button to open Add Modal */}
                <button className={styles.addButton} onClick={openAddModal}>
                    Adaugă Radiografie Nouă
                </button>
            </div>
            <div className={styles.rightSide}>
                {selectedRadiograph ? (
                    <div className={styles.radiographDetails}>
                        <p className={styles.xrayDetails}>Detalii Radiografie</p>
                        <img
                            src={getImageUrl(selectedRadiograph.filePath)}
                            alt={`Radiografia din ${selectedRadiograph.date}`}
                            className={styles.radiographImage}
                            onClick={openImageModal}
                        />
                        <p><strong>Data:</strong> {selectedRadiograph.date}</p>
                        <p>
                            <strong>Observații:</strong> {selectedRadiograph.observations || 'Nicio observație disponibilă'}
                        </p>
                        <button className={styles["edit_btn"]}
                                onClick={() => openEditModal(selectedRadiograph)}>Editează
                        </button>
                    </div>
                ) : (
                    <p>Selectați o radiografie pentru a vedea detaliile.</p>
                )}
            </div>

            {isInfoBoxVisible && <InfoBox message={"Radiograife editata cu succes"} onClose={closeInfoBox}/>}
            {isInfoAddNewBoxVisible && <InfoBox message={"Radiograife adaugata cu succes"} onClose={closeInfoAddNewBox}/>}

            {isAddModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles["addNewRadTitle"]}>Adaugă Radiografie Nouă</h2>
                        <form onSubmit={handleSubmit}>
                            <label className={styles["obs_title"]}>
                                Observații:
                                <textarea
                                    name="observations"
                                    value={newRadiograph.observations}
                                    onChange={e => handleInputChange(e)}
                                />
                            </label>
                            <label className={styles["obs_title"]}>
                                Imagine Radiografie:
                                <input type="file" name="file" onChange={e => handleFileChange(e)}/>
                            </label>
                            <button type="submit" className={styles.submitButton}>Trimite</button>
                            <button type="button" className={styles.closeButton} onClick={closeAddModal}>
                                X
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Editing Existing Radiograph */}
            {isEditModalOpen && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.editTitle}>Editează Radiografie</h2>
                        <form onSubmit={handleEditSubmit}>
                            <label>
                                Observații:
                                <textarea
                                    name="observations"
                                    value={editRadiograph.observations}  // Setăm valoarea curentă din starea `editRadiograph`
                                    onChange={e => handleInputChange(e, true)}  // Permitem modificarea observației
                                    required
                                />
                            </label>
                            <label>
                                Imagine Radiografie:
                                <input type="file" name="file" onChange={e => handleFileChange(e, true)}/>
                            </label>
                            <button type="submit" className={styles.submitButton}>Salvează Modificările</button>
                            <button type="button" className={styles.closeButton} onClick={closeEditModal}>
                                X
                            </button>
                        </form>
                    </div>
                </div>
            )}

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
    );
}

PatientRadiography.defaultProps = {
    cnp: ""
};

export default PatientRadiography;
