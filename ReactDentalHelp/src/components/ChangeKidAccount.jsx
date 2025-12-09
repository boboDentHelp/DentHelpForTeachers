import PatientPersonalData from "./PatientPersonalData.jsx";
import {useEffect, useState} from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from "../assets/css/RegisterNewUser.module.css";
import InfoBox from "./InfoBox.jsx";

function ChangeKidAccount({cnpKid, onRoleChangeSuccess }){

    const [infoChangeRoleBoxVisible, setChangeRoleInfoBoxVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState(false);

    const [emailKid, setEmailKid] = useState("");
    const [emailError, setEmailError] = useState(false);

    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    useEffect(() => {

    }, []); // Apelează useEffect când `props.cnp` se schimbă


    const handleChangeRole = async ()=>{
        if (!emailKid.trim()) {
            setEmailError(true);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                baseUrl+`/api/admin/patient/change/kid-to-patient/${cnpKid}/${emailKid}`,{

                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                setChangeRoleInfoBoxVisible(true);

                setTimeout(() => {
                    onRoleChangeSuccess();
                }, 3000);
            }

        } catch (error) {
            setErrorMessage(true);
            console.error('Eroare la schimbare', error.response.data.message);
        }
    }

    const closeInfoChangeUserRoleBox = () => {
        setChangeRoleInfoBoxVisible(false);
    };

    const closeErrorMessage = () => {
        setErrorMessage(false);
    };

    return(

            <div className={styles.alignCenter}>
                {infoChangeRoleBoxVisible && <InfoBox message={"Contul a fost migrat."} onClose={closeInfoChangeUserRoleBox}/>}
                {errorMessage && <InfoBox message={"Acest email aparține deja unui utilizator."} onClose={closeErrorMessage}/>}

                <p className={styles.text}>
                    Sunteți sigur/ă că doriți să migrați spre un cont individual pentru copilul selectat?<br/>Parola noului cont reprezintă CNP-ul copilui, aceasta poate fi schimbată ulterior.
                </p>

                <div style={{ marginBottom: "1rem", maxWidth: "300px" }}>
                    <Label htmlFor="email-kid">Email copil *</Label>
                    <Input
                        id="email-kid"
                        type="email"
                        required
                        value={emailKid}
                        onChange={(e) => setEmailKid(e.target.value)}
                        className={emailError ? "border-red-500" : ""}
                    />
                    {emailError && (
                        <p className="text-sm text-red-500 mt-1">Emailul este obligatoriu</p>
                    )}
                </div>
                <button className={styles.actionButton} onClick={()=>handleChangeRole()}>
                    Da, migrează!
                </button>
            </div>

    );
}


export default ChangeKidAccount