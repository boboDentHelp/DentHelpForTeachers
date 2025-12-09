import { useEffect, useState } from "react";
import styles from "../../assets/css/PatientPersonalData.module.css";
import axios from "axios";
import InfoBox from "../InfoBox.jsx";

function PatientPersonalData(props) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [addressStreet, setAddressStreet] = useState("");
    const [addressNumber, setAddressNumber] = useState("");
    const [addressCountry, setAddressCountry] = useState("");
    const [addressRegion, setAddressRegion] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [dob, setDob] = useState("");
    const [age, setAge] = useState("");
    const [editOn, setEdit] = useState(false);
    const [emailAddress, setEmailAddress] = useState("");
    const [sex, setSex] = useState(null);
    const [infoUpdateDataBoxVisible, setInfoUpdateDataBoxVisible] = useState(false);
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    const toggleEditMode = () => {
        setEdit((prevEdit) => !prevEdit);
    };

    const fetchPatientPersonalData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                baseUrl+`/api/admin/patient/get-patient-personal-data/${props.cnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                const data = response.data.data;
                console.log(data)
                setFirstName(data.firstName);
                setLastName(data.lastName);
                setAddressStreet(data.addressStreet);
                setAddressNumber(data.addressNumber);
                setAddressCountry(data.addressCountry);
                setAddressRegion(data.addressRegion);
                setPhoneNumber(data.phoneNumber);
                setSex(data.sex);
                setDob(data.dob);
                setAge(data.age);
                setEmailAddress(data.email);
            }
        } catch (error) {
            console.error('Eroare la preluarea datelor personale', error);
        }
    };

    const resetPatientData = () => {
        setFirstName("");
        setLastName("");
        setAddressStreet("");
        setAddressNumber("");
        setAddressCountry("");
        setAddressRegion("");
        setPhoneNumber("");
        setDob("");
        setAge("");
        setSex(null);
        setEmailAddress("");
    };

    useEffect(() => {
        if (props.cnp) {
            resetPatientData();
            fetchPatientPersonalData();
        }
    }, [props.cnp]);

    const handleEditForm = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                baseUrl+`/api/in/personalData/update-personal-data`,
                {
                    patientCnp: props.cnp, // Folosește direct props.cnp
                    addressCountry: addressCountry,
                    addressRegion: addressRegion,
                    addressNumber: addressNumber,
                    addressStreet: addressStreet,
                    phoneNumber: phoneNumber,
                    sex: sex
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                console.log('Datele au fost salvate cu succes.');
                setEdit(false);
                setInfoUpdateDataBoxVisible(true);
            }
        } catch (error) {
            console.error('Eroare la salvarea datelor', error);
        }
    };
    const closeInfoUpdateBox = () => {
        setInfoUpdateDataBoxVisible(false);
    };

    return (
        <div className={styles.patientDataContainer}>
            <h1 className={styles.title}>Date personale</h1>

            <div className={styles.switchContainer}>
                <label htmlFor="edit-switch">Editează:</label>
                <input
                    className={styles.checkbox}
                    type="checkbox"
                    checked={editOn}
                    onChange={toggleEditMode}
                />
            </div>

            {infoUpdateDataBoxVisible && <InfoBox message={"Date editate cu succes"} onClose={closeInfoUpdateBox}/>}

            {editOn ? (
                <div className={styles.patientDataContainerC}>
                    <div className={styles.formGroup}>
                        <label htmlFor="street-input">Strada:</label>
                        <input
                            type="text"
                            placeholder="scrieti raspunsul"
                            required
                            id="Strada-input"
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                        />
                    </div>
                    <div className={styles['formGroup']}>
                        <label htmlFor="number-input">Nr:</label>
                        <input
                            type="text"
                            placeholder="scrieti raspunsul"
                            required
                            id="number-input"
                            value={addressNumber}
                            onChange={(e) => setAddressNumber(e.target.value)}
                        />
                    </div>
                    <div className={styles['formGroup']}>
                        <label htmlFor="region-input">Localitatea:</label>
                        <input
                            type="text"
                            placeholder="scrieti raspunsul"
                            required
                            id="region-input"
                            value={addressRegion}
                            onChange={(e) => setAddressRegion(e.target.value)}
                        />
                    </div>
                    <div className={styles['formGroup']}>
                        <label htmlFor="country-input">Judet:</label>
                        <input
                            type="text"
                            placeholder="scrieti raspunsul"
                            required
                            id="country-input"
                            value={addressCountry}
                            onChange={(e) => setAddressCountry(e.target.value)}
                        />
                    </div>
                    <div className={styles['formGroup']}>
                        <label htmlFor="phone-number-input">Nr. Tel:</label>
                        <input
                            type="text"
                            placeholder="scrieti raspunsul"
                            required
                            id="phone-number-input"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                    </div>
                    <div className={styles['formGroup']}>
                        <div className={styles.options}>
                            <label htmlFor="sex-input">Gen:</label>
                            <div className={styles["sex_options"]}>
                            <label className={styles["sex_label"]}>
                            <input
                                type="radio"
                                id="sex-input"
                                name="sex"
                                value="male"
                                checked={sex === "male"}
                                onChange={() => setSex("male")}
                            />
                            Masculin
                        </label>
                            <label className={styles["sex_label"]}>
                                <input
                                    type="radio"
                                    name="sex"
                                    id="sex-input"
                                    value="female"
                                    checked={sex === "female"}
                                    onChange={() => setSex("female")}
                                />
                                Feminin
                            </label>
                        </div>
                        </div>
                    </div>
                    <button onClick={handleEditForm} className={styles.buttonSave}>
                        Salvati datele
                    </button>
                </div>
            ) : (
                <div className={styles.dataView}>
                    <h3 className={styles.addressT}>ADRESA</h3>
                    <p><strong>Strada:</strong> {addressStreet}</p>
                    <p><strong>Număr:</strong> {addressNumber}</p>
                    <p><strong>Localitate:</strong> {addressRegion}</p>
                    <p><strong>Județ:</strong> {addressCountry}</p>
                    <h3 className={styles["addressT"]}>CONTACT</h3>
                    <p><strong>Telefon:</strong> {phoneNumber}</p>
                    <p><strong>Gen:</strong> {sex === "male" ? "Masculin" : sex === "female" ? "Feminin" : ""}</p>
                </div>
            )}
        </div>
    );
}

PatientPersonalData.defaultProps = {
    cnp: ""
};
export default PatientPersonalData;
