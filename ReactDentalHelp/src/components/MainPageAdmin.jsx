import {useNavigate} from "react-router-dom";
import styles from "../assets/css/MainPagePatient.module.css"
import NavBar from "./NavBar.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, PersonIcon } from "@radix-ui/react-icons"

function MainPageAdmin(){

    const navigate = useNavigate();

    const handleAppointment = () => {
        navigate("/SchedulareAppointmentsPageAdmin");
    };
    const handlePatients = () => {
        navigate("/PatientsDoctor");
    };
    return (
        <div className={styles["page"]}>
            <NavBar></NavBar>
            <div className={styles["cards"]}>
                <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleAppointment}
                >
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <CalendarIcon className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-center">Programări</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Gestionează programările pacienților
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handlePatients}
                >
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <PersonIcon className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-center">Pacienți</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Informații despre pacienții tăi
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default MainPageAdmin;