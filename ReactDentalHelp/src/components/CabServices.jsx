import styles from "../assets/css/cabServices.module.css";
import dentalImage1 from "../assets/cabService/appointment.png";
import dentalImage2 from "../assets/cabService/appointment.png";
import dentalImage3 from "../assets/cabService/appointment.png";
import dentalImage4 from "../assets/cabService/appointment.png";
import dentalImage5 from "../assets/cabService/appointment.png";
import dentalImage6 from "../assets/cabService/appointment.png";
import NavBar from "./NavBar.jsx";

const CabServices = () => {
    return (
        <div>
            <NavBar></NavBar>
            <div className={styles["cab-services-container"]}>
            <h1 className={styles.title}>Servicii Dentare</h1>
            <p className={styles["description"]}>g
                Oferim o gamă largă de servicii dentare pentru a vă menține sănătatea
                orală la cel mai înalt nivel.
            </p>

            <div className={styles["service"]}>
                <img src={dentalImage1} alt="Consultatie dentara" className={styles["service-img"]} />
                <div className={styles["service-text"]}>
                    <h2>Consultație și Diagnostic</h2>
                    <p>Oferim consultații complete și diagnostic precis pentru orice problemă dentară.</p>
                </div>
            </div>

            <div className={styles["service"]}>
                <div className={styles["service-text"]}>
                    <h2>Igienizare Profesională</h2>
                    <p>Curățare profesională pentru a preveni cariile și bolile gingivale.</p>
                </div>
                <img src={dentalImage2} alt="Igienizare dentara" className={styles["service-img"]} />
            </div>

            <div className={styles["service"]}>
                <img src={dentalImage3} alt="Implant dentar" className={styles["service-img"]} />
                <div className={styles["service-text"]}>
                    <h2>Implanturi Dentare</h2>
                    <p>Restaurarea zâmbetului tău cu implanturi dentare de calitate.</p>
                </div>
            </div>

            <div className={styles["service"]}>
                <div className={styles["service-text"]}>
                    <h2>Ortodonție</h2>
                    <p>Corectarea poziției dinților și îmbunătățirea alinierii dentare prin aparate ortodontice moderne.</p>
                </div>
                <img src={dentalImage4} alt="Ortodontie" className={styles["service-img"]} />
            </div>

            <div className={styles["service"]}>
                <img src={dentalImage5} alt="Pedodontie" className={styles["service-img"]} />
                <div className={styles["service-text"]}>
                    <h2>Pedodonție</h2>
                    <p>Îngrijire dentară specializată pentru copii, pentru a asigura o dezvoltare orală sănătoasă.</p>
                </div>
            </div>

            <div className={styles["service"]}>
                <div className={styles["service-text"]}>
                    <h2>Tratamente de Canal</h2>
                    <p>Proceduri endodontice avansate pentru salvarea dinților afectați de infecții sau carii profunde.</p>
                </div>
                <img src={dentalImage6} alt="Tratamente de canal" className={styles["service-img"]} />
            </div>
        </div>
        </div>
    );
};

export default CabServices;
