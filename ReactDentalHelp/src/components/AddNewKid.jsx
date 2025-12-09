import axios from "axios";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {parseJwt} from "../service/authService.jsx";

function AddNewKid(){

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setSecondName] = useState("");
    const [cnp, setCnp] = useState("");
    const navigator = useNavigate();
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token')
        const decodedToken = parseJwt(token)
        const parentCnp = decodedToken.cnp

        try {
            const response = await axios.post(baseUrl+'/api/auth/register/kid', {
                firstName: firstName,
                lastName: lastName,
                cnp: cnp,
                parent: parentCnp
            });

            if (response.status === 200) {
                console.log('Kid added with success', response.data);
            } else {
                alert('Eroare la înregistrare: ' + response.statusText);
            }
        } catch (error) {
            console.error('Eroare de la server:', error.response ? error.response.data : error.message);
            alert('Eroare la înregistrare: ' + (error.response ? error.response.data.message : error.message));
        }
    };

    return(
        <div>
            <form onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                    <input placeholder="Nume" required id="register-firstName-input" value={firstName}
                           onChange={(e) => setFirstName(e.target.value)}/>
                </div>
                <div className="form-group">
                    <input placeholder="Prenume" required id="register-lastName-input" value={lastName}
                           onChange={(e) => setSecondName(e.target.value)}/>
                </div>
                <div className="form-group">
                    <input placeholder="CNP" required id="register-cnp-input" value={cnp}
                           onChange={(e) => setCnp(e.target.value)}/>
                </div>


                <button type="submit" className="btn">Crează Cont</button>
            </form>
        </div>
)
}

export default AddNewKid