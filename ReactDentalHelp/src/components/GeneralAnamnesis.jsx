import { useState, useEffect } from "react";
import axios from "axios";
import { parseJwt } from "../service/authService.jsx";
import styles from "../assets/css/GeneralAnamnesis.module.css";
import { Pencil2Icon, InfoCircledIcon, CheckIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import NavBar from "./NavBar.jsx";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function GeneralAnamnesis() {
    const [allergies, setAllergies] = useState("");
    const [medicalIntolerance, setMedicalIntolerance] = useState("");
    const [previousDentalProblems, setPreviousDentalProblems] = useState("");
    const [alcohol, setAlcohol] = useState();
    const [smoke, setSmoke] = useState();
    const [coagulation, setCoagulation] = useState();
    const [dataExists, setDataExists] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isViewing, setIsViewing] = useState(true);

    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoTitle, setInfoTitle] = useState("");
    const [infoText, setInfoText] = useState("");

    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const handleCloseInfoMdal = ()=>{
        setShowInfoModal(false);
    }

    const token = localStorage.getItem("token");
    const decodedToken = parseJwt(token);

    const fetchData = async () => {
        try {
            const response = await axios.get(
                baseUrl+`/api/in/general-anamnesis/get-general-anamnesis/${decodedToken.cnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200 && response.data.data) {
                setAllergies(response.data.data.allergies);
                setMedicalIntolerance(response.data.data.medicalIntolerance);
                setPreviousDentalProblems(response.data.data.previousDentalProblems);
                setAlcohol(response.data.data.alcoholConsumer);
                setSmoke(response.data.data.smoker);
                setCoagulation(response.data.data.coagulationProblems);
                setDataExists(true);
                console.log(response.data.data)
            }
        } catch (error) {
            console.error("Eroare la obținerea datelor: ", error);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const requestData = {
            allergies,
            medicalIntolerance,
            previousDentalProblems,
            alcoholConsumer: alcohol,
            smoker: smoke,
            coagulationProblems: coagulation,
            cnp: decodedToken.cnp,
        };

        try {
            const url = dataExists
                ? baseUrl+"/api/in/general-anamnesis/update-general-anamnesis"
                : baseUrl+"/api/in/general-anamnesis/add-general-anamnesis-patient";
            const method = dataExists ? "put" : "post";

            const response = await axios({
                method: method,
                url: url,
                data: requestData,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200 || response.status === 201)
                {
                    setShowInfoModal(true)
                if(dataExists)
                    setInfoText("Anamneza a fost actualizată cu succes")
                else{
                    setInfoText("Datele au fost salvate cu succes")
                }
                fetchData();
                setIsEditing(false);
                setIsViewing(true);
            } else {
                setShowInfoModal(true)
                setInfoText("Eroare la salvarea/actualizarea anamnezei: " + response.statusText)
            }
        } catch (error) {console.error("Eroare de la server:", error.response ? error.response.data : error.message);
            setShowInfoModal(true)
            if(error.response)
                setInfoText("Eroare la salvarea datelor: " + error.response.data.message);
            else{
                setInfoText("Eroare la salvarea datelor: " + error.message);
            }
        }
    };

    const handleView = () => {
        setIsViewing(true);
        setIsEditing(false);
    };

    const handleEdit = () => {
        setIsEditing(true);
        setIsViewing(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className={styles.page}>
            <NavBar></NavBar>
            <Dialog open={showInfoModal} onOpenChange={handleCloseInfoMdal}>
                <DialogContent className={styles.box}>
                    <p className={styles.text}>{infoText}</p>
                </DialogContent>
            </Dialog>
            <div className={styles.patientDataContainer}>
                <p className={styles.title}>Anamneza generală</p>

                <div className={styles.infoContainer}>
                    <p className={styles.infoMessage}>
                        <InfoCircledIcon className="inline-block" /> Completați informațiile cât mai exact pentru o comunicare eficientă.
                    </p>
                </div>

                <div className={styles.actionButtons}>
                    {dataExists ? (
                        <>
                            <button onClick={handleView} className={styles.buttonView}>
                                Vizualizare Date
                            </button>
                            <button onClick={handleEdit} className={styles.buttonEdit}>
                                 Editare Date
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className={styles.buttonEdit}>
                            Completare Date
                        </button>
                    )}
                </div>

                {/* Form for edit or add */}
                {isEditing && (
                    <form onSubmit={handleFormSubmit}>
                        <div className={styles.form}>
                            <div className={styles["formGroup"]}>
                                <label className={styles.label} htmlFor="allergies-input">Alergii:</label>
                                <input
                                    type="text"
                                    placeholder="scrieți răspunsul"
                                    required
                                    id="allergies-input"
                                    value={allergies}
                                    onChange={(e) => setAllergies(e.target.value)}
                                />
                            </div>

                            <div className={styles["formGroup"]}>
                                <label className={styles.label} htmlFor="medical-intolerance-input">Intoleranță la medicamente:</label>
                                <input
                                    type="text"
                                    placeholder="scrieți răspunsul"
                                    required
                                    id="medical-intolerance-input"
                                    value={medicalIntolerance}
                                    onChange={(e) => setMedicalIntolerance(e.target.value)}
                                />
                            </div>

                            <div className={styles["formGroup"]}>
                                <label className={styles.label} htmlFor="previous-dental-problems-input">Probleme dentare trecute:</label>
                                <input
                                    type="text"
                                    placeholder="scrieți răspunsul"
                                    required
                                    id="previous-dental-problems-input"
                                    value={previousDentalProblems}
                                    onChange={(e) => setPreviousDentalProblems(e.target.value)}
                                />
                            </div>

                            <div>
                                <div className={styles["formGroupB"]}>
                                    <label className={styles.label}>Consumați alcool?</label>
                                    <div className={styles["boolean-group"]}>
                                        <label className={styles["label_choice"]}>
                                            <input
                                                type="radio"
                                                name="alcohol"
                                                value="true"
                                                checked={alcohol === 'true'}
                                                onChange={() => setAlcohol('true')}
                                            />
                                            Da
                                        </label>
                                        <label className={styles["label_choice"]}>
                                            <input
                                                type="radio"
                                                name="alcohol"
                                                value="false"
                                                checked={alcohol === 'false'}
                                                onChange={() => setAlcohol('false')}
                                            />
                                            Nu
                                        </label>
                                    </div>
                                </div>

                                <div className={styles["formGroupB"]}>
                                    <label className={styles.label}>Fumați?</label>
                                    <div className={styles["boolean-group"]}>
                                        <label className={styles["label_choice"]}>
                                            <input
                                                type="radio"
                                                name="smoke"
                                                value="true"
                                                checked={smoke === 'true'}
                                                onChange={() => setSmoke('true')}
                                            />
                                            Da
                                        </label>
                                        <label className={styles["label_choice"]}>
                                            <input
                                                type="radio"
                                                name="smoke"
                                                value="false"
                                                checked={smoke === 'false'}
                                                onChange={() => setSmoke('false')}
                                            />
                                            Nu
                                        </label>
                                    </div>
                                </div>

                                <div className={styles["formGroupB"]}>
                                    <label className={styles.label}>Aveți probleme de coagulare?</label>
                                    <div className={styles["boolean-group"]}>
                                        <label className={styles["label_choice"]}>
                                        <input
                                            type="radio"
                                            name="coagulation"
                                            value="true"
                                            checked={coagulation === 'true'}
                                            onChange={() => setCoagulation('true')}
                                        />
                                        Da
                                    </label>
                                        <label className={styles["label_choice"]}>
                                        <input
                                            type="radio"
                                            name="coagulation"
                                            value="false"
                                            checked={coagulation === "false"}
                                            onChange={() => setCoagulation("false")}
                                        />
                                        Nu
                                    </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className={styles.buttonSave}>
                            {dataExists ? "Salvează Modificările" : "Salvează Datele"}
                        </button>
                    </form>
                )}

                {/* Data view */}
                {isViewing && dataExists && (
                    <div className={styles.dataView}>
                        <p><strong>Alergii:</strong> {allergies}</p>
                        <p><strong>Intoleranță la medicamente:</strong> {medicalIntolerance}</p>
                        <p><strong>Probleme dentare trecute:</strong> {previousDentalProblems}</p>
                        <p><strong>Consumați alcool:</strong> {alcohol ==="true"? "Da":alcohol ==="false"? "Nu":""}</p>
                        <p><strong>Fumați:</strong> {smoke ==="true"? "Da" : smoke ==="false"? "Nu": ""}</p>
                        <p><strong>Probleme de coagulare:</strong> {coagulation ==="true"? "Da": coagulation === "false"?"Nu":""}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GeneralAnamnesis;
