import Scheduler from "./Scheduler.jsx";
import ConfirmAppointments from "./ConfirmAppointments.jsx";
import {useEffect, useState} from "react";
import styles from '../assets/css/SchedulareAppointmentsPageAdmin.module.css'
import NavBar from "./NavBar.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import moment from "moment/moment.js";
import axios from "axios";
import NotificationsAdmin from "./NotificationsAdmin.jsx";

function SchedulareAppointmentsPageAdmin() {
    const [activeComponent, setActiveComponent] = useState('scheduler');
    const [manualModalIsOpen, setManualModalIsOpen] = useState(false);
    const [patients, setPatients] = useState([]);
    const [selectedPatientCNP, setSelectedPatientCNP] = useState(''); // State for selected patient CNP
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const handleComponentChange = (component) => {
        setActiveComponent(component);
    };
    const [newAppointment, setNewAppointment] = useState({
        patient: '',
        start: null,
        end: null,
        appointmentReason: '',
    });
    const closeModal = () => {
        setManualModalIsOpen(false);
        setNewAppointment({
            patient: '',
            start: null,
            end: null,
            appointmentReason: '',
        });
    };

    const openManualModal = () => {
        handleComponentChange('addApp')
        setNewAppointment({
            patient: '',
            start: null,
            end:null,
            appointmentReason: '',
        });
        setManualModalIsOpen(true);
    };

    const fetchPatients = async () =>{
        try{
            const token = localStorage.getItem("token");
            const response = await axios.get(baseUrl+'/api/admin/patient/get-patients', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = response.data.data;
            if (Array.isArray(data)) {
                const apiPatients = data.map((patient) => ({
                    patientFirstName: patient.firstName,
                    patientSecondName: patient.lastName,
                    patientCnp: patient.cnp
                }));
                console.log(data)
                setPatients(apiPatients); // Setează evenimentele preluate în starea `events`
            } else {
                console.error('Datele primite despre pacienti nu sunt un array:', data);
            }
        } catch (error) {
            console.error('Eroare la preluarea evenimentelor:', error);
        }
    };

    const addNewAppointment = async () => {

        try {
            const token = localStorage.getItem('token');
            const formattedStart = moment(newAppointment.start).format('DD/MM/YYYY HH:mm');
            const formattedEnd = moment(newAppointment.end).format('DD/MM/YYYY HH:mm');
            const response = await axios.post(
                baseUrl+"/api/admin/appointment/make-appointment",
                {
                    appointmentReason: newAppointment.appointmentReason,
                    patientCnp: selectedPatientCNP,
                    date: formattedStart,
                    hour: formattedEnd
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Trimite token-ul JWT în header-ul Authorization
                    },
                }
            );

            if (response.status === 200) {
                console.log(
                    "Programare salvata cu succes",
                    response.data
                );
            } else {
                alert("Eroare la salvarea programarii: " + response.statusText);
            }
        } catch (error) {
            console.error(
                "Eroare de la server:",
                error.response ? error.response.data : error.message
            );
            alert(
                "Eroare la salvarea programarii: " +
                (error.response ? error.response.data.message : error.message)
            );
        }
        closeModal();
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <div className={styles["page"]}>
            <NavBar></NavBar>
            <div className={styles["content"]}>
                <div className={styles['slidebar']}>
                    <button
                        className={styles[activeComponent === 'scheduler' ? "slidebar-buttons-active" : "slidebar-buttons"]}
                        onClick={() => handleComponentChange('scheduler')}
                    >
                        Scheduler
                    </button>

                    <button
                        className={styles[activeComponent === 'confirmations' ? "slidebar-buttons-active" : "slidebar-buttons"]}
                        onClick={() => handleComponentChange('confirmations')}
                    >
                        Solicitari Programări
                    </button>
                    <button
                        className={styles[activeComponent === 'addApp' ? "slidebar-buttons-active" : "slidebar-buttons"]}
                        onClick={openManualModal}
                    >
                        Adaugă Programare
                    </button>

                    <button
                        className={styles[activeComponent === 'notifications' ? "slidebar-buttons-active" : "slidebar-buttons"]}
                        onClick={() => handleComponentChange('notifications')}
                    >
                        Notificări
                    </button>
                </div>

                {/* Conținutul schimbabil */}
                <div style={{flexGrow: 1, padding: '20px'}}>
                    {activeComponent === 'scheduler' && <Scheduler/>}
                    {activeComponent === 'confirmations' && <ConfirmAppointments/>}
                    {activeComponent === 'notifications' && <NotificationsAdmin/>}
                </div>
            </div>

            <Dialog open={manualModalIsOpen} onOpenChange={setManualModalIsOpen}>
                <DialogContent className={styles.modalContent}>
                    <DialogHeader>
                        <DialogTitle>Adaugă Programare</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="start-datetime">Data și ora de început</Label>
                            <Input
                                id="start-datetime"
                                type="datetime-local"
                                value={newAppointment.start ? moment(newAppointment.start, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DDTHH:mm') : ''}
                                onChange={(e) => {
                                    const date = e.target.value ? moment(e.target.value).format('DD/MM/YYYY HH:mm') : '';
                                    setNewAppointment({ ...newAppointment, start: date });
                                }}
                            />
                        </div>
                        <div>
                            <Label htmlFor="end-datetime">Data și ora de sfârșit</Label>
                            <Input
                                id="end-datetime"
                                type="datetime-local"
                                value={newAppointment.end ? moment(newAppointment.end, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DDTHH:mm') : ''}
                                onChange={(e) => {
                                    const date = e.target.value ? moment(e.target.value).format('DD/MM/YYYY HH:mm') : '';
                                    setNewAppointment({ ...newAppointment, end: date });
                                }}
                            />
                        </div>

                        <div>
                            <Label htmlFor="patient-select">Pacient</Label>
                            <Select
                                value={selectedPatientCNP}
                                onValueChange={(value) => {
                                    setSelectedPatientCNP(value);
                                    setNewAppointment({ ...newAppointment, patient: value });
                                }}
                            >
                                <SelectTrigger id="patient-select">
                                    <SelectValue placeholder="Selectează pacient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {patients.map((patient) => (
                                        <SelectItem key={patient.patientCnp} value={patient.patientCnp}>
                                            {`${patient.patientFirstName} ${patient.patientSecondName} (${patient.patientCnp})`}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="reason">Motiv</Label>
                            <Input
                                id="reason"
                                value={newAppointment.reason}
                                onChange={(e) => setNewAppointment({ ...newAppointment, reason: e.target.value })}
                            />
                        </div>

                        <Button
                            onClick={addNewAppointment}
                            className="mt-2"
                        >
                            Adaugă Programare
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}

export default SchedulareAppointmentsPageAdmin;
