import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import styles from "../assets/css/RegisterNewUser.module.css";
import user_photo from "../assets/patients_photo/user.png";
import PatientPersonalData from "./PatientsDoctorComponents/PatientPersonalData.jsx";
import InfoBox from "./InfoBox.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, TrashIcon } from "@radix-ui/react-icons";


const RegisterNewUser = () =>{
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setSecondName] = useState("");
    const [cnp, setCnp] = useState("");
    const [password, setPassword] = useState("");
    const [reTypePassword, setRePassword] = useState("");
    const [userRole, setUserRole] = useState("");
    const navigator = useNavigate();
    const [activeTab, setActiveTab] = useState(0);
    const [patients, setPatients] = useState([]);
    const [radiologists, setRadiologists] = useState([])
    const [selectedPatientCnp, setSelectedPatientCnp] = useState(null);
    const [infoAddUserBoxVisible, setAddUserInfoBoxVisible] = useState(false);
    const [infoChangeRoleBoxVisible, setChangeRoleInfoBoxVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showErrorMessage, setShowErrorMessage] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [infoDeleteUserBoxVisible, setDeleteUserInfoBoxVisible] = useState(false);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const handleArrowClick = () => {
        setShowModal(true);
    };

    const handleRegisterSubmit= async (e) =>{
        e.preventDefault();
            try {
                const token = localStorage.getItem('token');
                console.log('Sending request to:', baseUrl+`/api/admin/patient/addPatient`);
                console.log('Request data:', {
                    firstName,
                    lastName,
                    cnp,
                    email,
                    userRole,
                });

                const response = await axios.post(
                    baseUrl+`/api/admin/patient/addPatient`,
                    {
                        firstName: firstName,
                        lastName: lastName,
                        cnp: cnp,
                        email: email,
                        parent: null,
                        userRole: userRole,
                        password: password
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                if (response.status === 200) {
                    setAddUserInfoBoxVisible(true);
                    setFirstName("");
                    setSecondName("");
                    setCnp("");
                    setEmail("");
                    setUserRole("");
                    setPassword("");
                    // Refresh patient list
                    fetchPatients();
                }
            } catch (error) {
                console.error('Eroare la inregistrare:', error);
                let errorMsg = 'A apărut o eroare la înregistrare';

                if (error.response) {
                    // Server responded with error
                    console.error('Error response:', error.response);
                    errorMsg = error.response.data?.message || error.response.data?.error || errorMsg;
                } else if (error.request) {
                    // Request was made but no response
                    console.error('No response received:', error.request);
                    errorMsg = 'Nu s-a putut contacta serverul. Verificați dacă backend-ul rulează.';
                } else {
                    // Something else happened
                    console.error('Error message:', error.message);
                    errorMsg = error.message;
                }

                setShowErrorMessage(true);
                setErrorMessage(errorMsg);
            }
    } ;
    const fetchPatients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(baseUrl+'/api/admin/patient/get-patients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const patients = response.data.data.filter((patient)=>patient.userRole==="PATIENT")
            const radiologists = response.data.data.filter((patient)=>patient.userRole==="RADIOLOGIST")

            console.log(radiologists)
            setPatients(patients);
            setRadiologists(radiologists)
        } catch (error) {
            console.error('Error fetching patients', error);
        }
    };

    const handlePatientSelect = (cnp) => {
        setSelectedPatientCnp(cnp);
        console.log(cnp)
    };

    const handleCloseConfirmModal = () => setShowConfirmModal(false);

    const handleOpenQuestionModal = () => {
        setShowConfirmModal(true);
    };

    const handleChangeRole = async ()=>{
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                baseUrl+`/api/admin/patient/change-radiologist-to-patient/${selectedPatientCnp}`,{

                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                setChangeRoleInfoBoxVisible(true)
                fetchPatients()
                handleCloseModal()
                setShowConfirmModal(false)
                setSelectedPatientCnp(null)
            }
        } catch (error) {
            console.error('Eroare la schimbare', error);
        }
    }

    useEffect(() => {
        fetchPatients();
    }, []);

    const closeInfoAddUserBox = () => {
        setAddUserInfoBoxVisible(false);
    };

    const closeInfoChangeUserRoleBox = () => {
        setChangeRoleInfoBoxVisible(false);
    };

    const closeErrorMessageBox = () => {
        setErrorMessage("");
        setShowErrorMessage(false)
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleDeleteClick = (cnp, event) => {
        event.stopPropagation(); // Prevent triggering patient selection
        setUserToDelete(cnp);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                baseUrl + `/api/admin/patient/delete-patient/${userToDelete}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                setDeleteUserInfoBoxVisible(true);
                fetchPatients();
                setShowDeleteModal(false);
                setUserToDelete(null);
                setSelectedPatientCnp(null);
            }
        } catch (error) {
            console.error('Eroare la ștergere utilizator:', error);
            let errorMsg = 'A apărut o eroare la ștergerea utilizatorului';
            if (error.response) {
                errorMsg = error.response.data?.message || error.response.data?.error || errorMsg;
            }
            setShowErrorMessage(true);
            setErrorMessage(errorMsg);
            setShowDeleteModal(false);
        }
    };

    const closeInfoDeleteUserBox = () => {
        setDeleteUserInfoBoxVisible(false);
    };

    return (
        <div className={styles.contentPage}>
            {infoAddUserBoxVisible && <InfoBox message={"Utilizatorul a fost adaugat cu succes."} onClose={closeInfoAddUserBox}/>}
            {infoChangeRoleBoxVisible && <InfoBox message={"Rolul utilizatoruli a fost schimbat cu succes."} onClose={closeInfoChangeUserRoleBox}/>}
            {infoDeleteUserBoxVisible && <InfoBox message={"Utilizatorul a fost șters cu succes."} onClose={closeInfoDeleteUserBox}/>}
            {showErrorMessage && <InfoBox message={errorMessage} onClose={closeErrorMessageBox}/>}

            <div className={styles.users}>
                <div className={styles.usersVertical}>
                    <div className={styles.tabButtons}>
                        <button
                            className={`${styles.tabButton} ${activeTab === 0 ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(0)}
                        >Radiologi
                        </button>
                        <button
                            className={`${styles.tabButton} ${activeTab === 1 ? styles.activeTab : ''}`}
                            onClick={() => setActiveTab(1)}
                        >Pacienti
                        </button>
                    </div>
                    { activeTab === 1?(
                    <div className={styles.patientList}>
                        {patients.map((patient) => (
                            <div
                                key={patient.cnp || patient.id}
                                className={`${styles.patientCard} ${selectedPatientCnp === patient.cnp ? styles.selectedPatient : ''}`}
                                onClick={() => handlePatientSelect(patient.cnp)}
                            >
                                <img
                                    src={user_photo}
                                    alt={`${patient.firstName || 'Unknown'} ${patient.lastName || 'Patient'}`}
                                    className={styles.patientPhoto}
                                />
                                <p>{`${patient.firstName || 'Unknown'} ${patient.lastName || 'Patient'}`} <br/> {`(${patient.cnp})`}</p>
                                <TrashIcon
                                    className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800"
                                    onClick={(e) => handleDeleteClick(patient.cnp, e)}
                                />
                            </div>
                        ))}
                    </div>
                    ): (
                        <div className={styles.patientList}>
                            {radiologists.map((patient) => (
                                <div
                                    key={patient.cnp || patient.id}
                                    className={`${styles.patientCard} ${selectedPatientCnp === patient.cnp ? styles.selectedPatient : ''}`}
                                    onClick={() => handlePatientSelect(patient.cnp)}
                                >
                                    <img
                                        src={user_photo}
                                        alt={`${patient.firstName || 'Unknown'} ${patient.lastName || 'Patient'}`}
                                        className={styles.patientPhoto}
                                    />
                                    <p>{`${patient.firstName || 'Unknown'} ${patient.lastName || 'Patient'}`} <br/> {`(${patient.cnp})`}</p>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <ArrowRightIcon
                                            className="h-6 w-6 text-cyan-600 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); handleArrowClick(patient.cnp); }}
                                        />
                                        <TrashIcon
                                            className="h-5 w-5 text-red-600 cursor-pointer hover:text-red-800"
                                            onClick={(e) => handleDeleteClick(patient.cnp, e)}
                                        />
                                    </div>
                                </div>
                            ))}

                            <Dialog open={showModal} onOpenChange={handleCloseModal}>
                                <DialogContent className={styles.box}>
                                    <DialogHeader>
                                        <DialogTitle className={styles.changeRolT}>Schimbare Rol Utilizator</DialogTitle>
                                    </DialogHeader>
                                    <p className={styles.text}>
                                        Poți schimba rolul unui radiolog în pacient apăsând butonul de mai jos.
                                    </p>
                                    <button className={styles.actionButton} onClick={handleOpenQuestionModal}>
                                        Schimbă rol
                                    </button>
                                    <button onClick={handleCloseModal}>Închide</button>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={showConfirmModal} onOpenChange={handleCloseConfirmModal}>
                                <DialogContent className={styles.box}>
                                    <DialogHeader>
                                        <DialogTitle className={styles.changeRolT}>Confirmare</DialogTitle>
                                    </DialogHeader>
                                    <p className={styles.text}>
                                        Ești sigur că dorești să schimbi rolul acestui utilizator?
                                    </p>
                                    <button className={styles.actionButton} onClick={()=>handleChangeRole()}>
                                        Da, schimbă rolul
                                    </button>
                                    <button onClick={handleCloseConfirmModal}>Anulează</button>
                                </DialogContent>
                            </Dialog>

                        </div>
                    )}

                    <Dialog open={showDeleteModal} onOpenChange={handleCloseDeleteModal}>
                        <DialogContent className={styles.box}>
                            <DialogHeader>
                                <DialogTitle className={styles.changeRolT}>Confirmare Ștergere</DialogTitle>
                            </DialogHeader>
                            <p className={styles.text}>
                                Ești sigur că dorești să ștergi acest utilizator? Această acțiune nu poate fi anulată.
                            </p>
                            <button className={styles.actionButton} onClick={handleConfirmDelete}>
                                Da, șterge utilizatorul
                            </button>
                            <button onClick={handleCloseDeleteModal}>Anulează</button>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className={styles.userDetails}>
                    <PatientPersonalData cnp={selectedPatientCnp}/>
                </div>
            </div>
            <div className={styles["card-content"]}>
                <p className={styles.registerNewUserT}>Întregistrați un utilizator</p>
                <form className={styles.form} onSubmit={handleRegisterSubmit}>
                    <input className={styles["form-group"]} placeholder="Nume" required id="register-firstName-input" value={firstName}
                               onChange={(e) => setFirstName(e.target.value)}/>

                    <input className={styles["form-group"]} placeholder="Prenume" required id="register-lastName-input" value={lastName}
                               onChange={(e) => setSecondName(e.target.value)}/>
                    <input className={styles["form-group"]} placeholder="CNP" required id="register-cnp-input" value={cnp}
                           onChange={(e) => setCnp(e.target.value)}/>
                    <input className={styles["form-group"]} placeholder="Adresa e-mail" required id="register-email-input" value={email}
                           onChange={(e) => setEmail(e.target.value)}/>
                    <input className={styles["form-group"]} type="password" placeholder="Parola" required id="register-password-input"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}/>

                <div className={styles["boolean-group"]}>
                    <label>Rolul Utilizatorului:</label>
                    <label className={styles.user_role_label}>
                        <input type="radio" name="userRole" value="PATIENT" checked={userRole === "PATIENT"}
                               onChange={() => setUserRole("PATIENT")}/> Pacient
                    </label>
                    <label className={styles.user_role_label}>
                        <input type="radio" name="userRole" value="RADIOLOGIST" checked={userRole === "RADIOLOGIST"}
                               onChange={() => setUserRole("RADIOLOGIST")}/> Radiolog
                    </label>
                </div>
                <button type="submit" className="btn">Crează Cont</button>
            </form>
        </div>
        </div>
    )
}

export default RegisterNewUser