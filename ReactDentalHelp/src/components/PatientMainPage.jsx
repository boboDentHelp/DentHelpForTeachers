import appointmentCardPic from "../assets/cards_photos/appointment.png";
import kidsCardPic from "../assets/cards_photos/kids.png";
import medicalHistoryCardPic from "../assets/cards_photos/health-report.png";
import { useNavigate } from "react-router-dom";
import NavBar from "./NavBar.jsx";
import styles from "../assets/css/PatientMainPage.module.css";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CounterClockwiseClockIcon, PersonIcon } from "@radix-ui/react-icons"

function PatientMainPage() {
    const navigate = useNavigate();

    const handleClickPersonalData = () => {
        navigate("/PatientHistoryData");
    };
    const handleClickKids = () => {
        navigate("/KidsMainPage");
    };
    const handleRequestAppointment = () => {
        navigate("/RequestAppointment");
    };

    return (
        <div className={styles.page}>
            <NavBar />
            <div className={styles.cards}>
                <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleRequestAppointment}
                >
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <CalendarIcon className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-center">Request Appointment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Book an appointment quickly and easily.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleClickPersonalData}
                >
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <CounterClockwiseClockIcon className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-center">Medical History & Personal Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Access your medical history and personal information.
                        </CardDescription>
                    </CardContent>
                </Card>

                <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleClickKids}
                >
                    <CardHeader>
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <PersonIcon className="h-12 w-12 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-center">Children</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="text-center">
                            Manage your children's appointments and medical information.
                        </CardDescription>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default PatientMainPage;
