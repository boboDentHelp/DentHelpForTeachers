import styles from "../assets/css/HandleKidAccount.module.css";
import kid_img from "../assets/kids_photos/13.png";
import user_photo from "../assets/patients_photo/user.png";
import { useEffect, useState } from "react";
import axios from "axios";
import { parseJwt } from "../service/authService.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PatientPersonalData from "./PatientsDoctorComponents/PatientPersonalData.jsx";
import PatientGeneralAnamnesis from "./PatientsDoctorComponents/PatientGeneralAnamnesis.jsx";
import PatientAppointmentsForDoctor from "./PatientsDoctorComponents/PatientAppointmentsForDoctor.jsx";
import PatientRadiography from "./PatientsDoctorComponents/PatientRadiography.jsx";
import PatientStatus from "./PatientsDoctorComponents/PatientStatus.jsx";
import RequestAppointment from "./RequestAppointment.jsx";
import RequestAppointmentKid from "./RequestAppointmentKid.jsx";
import XrayPatientComponent from "./XrayPatientComponent.jsx";
import GeneralDentalStatusComponent from "./GeneralDentalStatusComponent.jsx";
import NavBar from "./NavBar.jsx";
import ChangeKidAccount from "./ChangeKidAccount.jsx";
import arrow from "../assets/icons/interaction.png";

function HandleKidAccount() {
    const [kids, setKids] = useState([]);
    const [selectedKidCnp, setSelectedKidCnp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newKidData, setNewKidData] = useState({ firstName: "", lastName: "", cnp: "" });
    const [activeTab, setActiveTab] = useState(5);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoText, setInfoText] = useState("");
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    const handleCloseInfoMdal = ()=>{
        setShowInfoModal(false);
    }
    const fetchPatients = async () => {
        const token = localStorage.getItem("token");
        const decodedToken = parseJwt(token);
        const cnp = decodedToken.cnp;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(baseUrl+`/api/admin/patient/get-kids/${cnp}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setKids(response.data.data); // Assuming response.data contains an array of patients
            console.log(response.data.data)
        } catch (error) {
            console.error('Error fetching patients', error);
        }

    };

    useEffect(() => {
        fetchPatients();
    }, []);

    // Funcția de selectare a unui copil
    const handleKidSelect = (cnp) => {
        setSelectedKidCnp(cnp);  // Selectăm copilul după CNP
    };

    // Funcția pentru a deschide modalul
    const handleAddKidClick = () => {
        setShowModal(true);
    };

    // Funcția pentru a închide modalul
    const handleCloseModal = () => {
        setShowModal(false);
    };

    // Funcția pentru a actualiza valorile din formular
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewKidData((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleRegisterKid = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token')
        const decodedToken = parseJwt(token)
        const parentCnp = decodedToken.cnp

        try {
            const response = await axios.post(baseUrl+'/api/auth/register/kid', {
                firstName: newKidData.firstName,
                lastName: newKidData.lastName,
                cnp: newKidData.cnp,
                parent: parentCnp
            });

            if (response.status === 200) {
                console.log('Kid added with success', response.data);
                handleCloseModal()
                setShowInfoModal(true);
                setInfoText("Întregistrare cu succes");
                setNewKidData({firstName: "", lastName: "", cnp: ""})
                fetchPatients()
            } else {
                setShowInfoModal(true);
                setInfoText('Eroare la înregistrare: ' + response.statusText);
            }
        } catch (error) {
            setShowInfoModal(true);
            if(error.response)
            {
                setInfoText('Eroare la înregistrare: ' + error.response.data);
            }
            else{
                setInfoText('Eroare la înregistrare: ' + error.message);
            }
            console.error('Eroare de la server:', error.response ? error.response.data : error.message);
        }
    };

    const selectedKid = kids.find((kid) => kid.cnp === selectedKidCnp);

    const renderTabContent = () => {
        if (!selectedKidCnp) {
            return <p>Selectează un pacient pentru a vedea detaliile acestuia.</p>;
        }

        switch (activeTab) {
            case 0:
                return <PatientPersonalData cnp={selectedKidCnp} />;
            case 1:
                return <PatientGeneralAnamnesis cnp={selectedKidCnp} />;
            case 2:
                return <PatientAppointmentsForDoctor cnp={selectedKidCnp} />;
            case 3:
                return <XrayPatientComponent cnp={selectedKidCnp} />;
            case 4:
                return <GeneralDentalStatusComponent cnp={selectedKidCnp} />;
            case 5:
                return <RequestAppointmentKid cnpProp={selectedKidCnp} />;
            case 6:
                return <ChangeKidAccount cnpKid={selectedKidCnp}  onRoleChangeSuccess={handleRoleChangeSuccess} />;
            default:
                return null;
        }
    };

    const handleRoleChangeSuccess = () => {
        fetchPatients(); // ← reîncarcă lista de copii
        setSelectedKidCnp(null); // ← sau setează un alt copil, dacă vrei
    };

    return (
        <div className={styles.page}>
            <NavBar></NavBar>
            <Dialog open={showInfoModal} onOpenChange={handleCloseInfoMdal}>
                <DialogContent className={styles.box}>
                    <p className={styles.text}>{infoText}</p>
                </DialogContent>
            </Dialog>
            <div className={styles.page_content}>
                <div className={styles.left_side}>
                        <h1 className={styles["title"]}>Hai cu copilul la stomatolog</h1>
                        <p className={styles.text1}>
                            Programează copilul la medicul stomatolog și supravegheă-i evoluția dentară.
                        </p>
                        <p className={styles["text2"]}>
                            Acesta poate oricând să migreze către un cont independent și să își păstreze întreg istoricul medical.
                        </p>
                        <button className={styles["add-new-kid-btn"]} onClick={handleAddKidClick}>
                            Adăugă un copil
                        </button>
                        <img className={styles["img"]} src={kid_img} alt="kid" />
                    </div>
                <div className={styles.right_side}>
                    <div className={styles.kidsList}>
                        <h3 className={styles.kidsTitle}>Copiii</h3>
                        {kids.length > 0 ? (
                            kids.map((kid) => (
                                <div
                                    key={kid.id}
                                    className={`${styles.kidCard} ${
                                        selectedKidCnp === kid.cnp ? styles.selectedPatient : ""
                                    }`}
                                    onClick={() => handleKidSelect(kid.cnp)}
                                ><p>{`${kid.firstName} ${kid.lastName}`}</p>
                                </div>
                            ))
                        ) : (
                            <div className={styles["no-kids"]}>
                                <p>Nu aveți copii adăugați.</p>
                            </div>
                        )}
                    </div>
                    <div className={styles["kid-details"]}>
                                {selectedKid ? (
                                    <div>
                                        <div className={styles.tabButtons}>
                                            <button
                                                className={`${styles.tabButton} ${activeTab === 5 ? styles.activeTab : ''}`}
                                                onClick={() => setActiveTab(5)}
                                            >Solicitați o programare
                                            </button>
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
                                            <button
                                                className={`${styles.tabButton} ${activeTab === 6 ? styles.activeTab : ''}`}
                                                onClick={() => setActiveTab(6)}
                                            >Migrați contul
                                            </button>
                                        </div>
                                        <div className={styles.tabContent}>
                                            {renderTabContent()}
                                        </div>
                                    </div>

                                ) : (
                                    <div className={styles["no-selection"]}>
                                        <h2 className={styles.selectKidT}>Selectați un copil</h2>
                                        <p className={styles.selectKidP}>Alegeți un copil din lista din dreapta pentru a vizualiza detalii și opțiuni.</p>
                                    </div>
                                )}
                            </div>
                </div>
                <Dialog open={showModal} onOpenChange={handleCloseModal}>
                    <DialogContent className={styles.box}>
                        <DialogHeader>
                            <DialogTitle className={styles.addKidT}>Adăugați un copil</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="firstName">Nume</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={newKidData.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Prenume</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={newKidData.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <Label htmlFor="cnp">CNP</Label>
                                <Input
                                    id="cnp"
                                    name="cnp"
                                    value={newKidData.cnp}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex justify-between mt-4">
                                <button className={styles.addKidBtn} onClick={handleRegisterKid}>
                                    Adaugă copilul
                                </button>
                                <button onClick={handleCloseModal}>
                                    Anulează
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default HandleKidAccount;
