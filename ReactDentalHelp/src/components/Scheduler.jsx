import {useEffect, useState} from 'react';
import {Calendar, dateFnsLocalizer, momentLocalizer} from 'react-big-calendar';
import moment from 'moment';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from "axios";
import {useNavigate} from "react-router-dom";
import styles from "../assets/css/Scheduler.module.css"
import 'moment/locale/ro';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import ro from 'date-fns/locale/ro';

const locales = {
    ro: ro,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});


const Scheduler = () => {
    const navigate = useNavigate()
    const [events, setEvents] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedPatientCNP, setSelectedPatientCNP] = useState('');
    const [appointmentReason, setAppointmentReason] = useState(null);
    const [patientName, setPatientName] = useState("");
    const [cnpPatientForRedirection, setCnpPatientForRedirection] = useState("");
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [isAddingAppointment, setIsAddingAppointment] = useState(false);
    const [manualModalIsOpen, setManualModalIsOpen] = useState(false);
    const [newAppointment, setNewAppointment] = useState({
        patient: '',
        start: null,
        end: null,
        appointmentReason: '',
    });

    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const [selectedEventId, setSelectedEventId] = useState(null);
    const [confirmationModal, setConfirmationModal] = useState(false);

    // Funcția pentru a prelua datele de la API
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
                setPatients([]); // Set empty array as fallback
            }
        } catch (error) {
            console.error('Eroare la preluarea evenimentelor:', error);
            setPatients([]); // Set empty array on error
        }
    };

    const fetchPatientNameByCnp = async (patientCnp) => {
        try {
            const token = localStorage.getItem("token")
            console.log(patientCnp);
            const response = await axios.get(
                baseUrl+`/api/admin/patient/get-patient-personal-data/${patientCnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                const data = response.data.data;
                const complete_name = [data.firstName, data.lastName].filter(Boolean).join(" ") || "Unknown Patient";
                return complete_name; // Returnează numele pacientului
            }
        } catch (error) {
            console.error("Eroare la extragerea pacientului:", error);
        }
    };

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(baseUrl+'/api/admin/appointment/get-appointments', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = response.data.data;
            if (Array.isArray(data)) {
                const apiEvents = data.map((event) => ({
                    id: event.appointmentId,
                    appointmentReason: event.appointmentReason,
                    // Folosim moment.js pentru a converti string-urile în obiecte de tip Date
                    start: moment(event.date, 'DD/MM/YYYY HH:mm').toDate(),
                    end: moment(event.hour, 'DD/MM/YYYY HH:mm').toDate(),
                    patient: event.patientCnp,
                }));

                setEvents(apiEvents); // Setează evenimentele preluate în starea `events`
            } else {
                console.error('Datele primite nu sunt un array:', data);
                setEvents([]); // Set empty array as fallback
            }
        } catch (error) {
            console.error('Eroare la preluarea evenimentelor:', error);
            setEvents([]); // Set empty array on error
        }
    };


    useEffect(() => {
        fetchEvents();
        fetchPatients();
    }, []);


    // Funcția pentru a deschide modalul la selectarea unei programări
    const openModalForEdit = (event) => {
        setNewAppointment({
            patient: event.patient,
            start: event.start,
            end: event.end,
            appointmentReason:event.appointmentReason
        });
        setSelectedEventId(event.id);
        setModalIsOpen(true);
        setIsAddingAppointment(false);
    };

    // Funcția pentru a deschide modalul pentru adăugarea unei programări
    const openModalForNew = ({ start, end }) => {
        setNewAppointment({
            patient: '',
            appointmentReason: '',
            start,
            end,
        });
        setSelectedEventId(null);
        setModalIsOpen(true);
        setIsAddingAppointment(true);
    };

    // Funcția pentru a închide modalul
    const closeModal = () => {
        setModalIsOpen(false);
        setManualModalIsOpen(false);
        setNewAppointment({
            patient: '',
            start: null,
            end: null,
            appointmentReason: '',
        });
    };

    // Funcția pentru a adăuga o nouă programare
    const addNewAppointment = async () => {

        try {
            const token = localStorage.getItem('token');
            const formattedStart = moment(newAppointment.start).format('DD/MM/YYYY HH:mm');
            const formattedEnd = moment(newAppointment.end).format('DD/MM/YYYY HH:mm');
            const response = await axios.post(
                baseUrl+"/api/admin/appointment/make-appointment",
                {
                    appointmentReason: appointmentReason,
                    patientCnp: selectedPatientCNP,
                    date: formattedStart,
                    hour: formattedEnd,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Trimite token-ul JWT în header-ul Authorization
                    },
                }
            );

            if (response.status === 200) {
                await fetchEvents();
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

    const confirmDeleteAppointment =()=>{
        setConfirmationModal(true);
    }

    const closeConfirmModal =()=>{
        setConfirmationModal(false);
    }

    // Funcția pentru a șterge programarea selectată
    const deleteAppointment = async ()  => {
        closeConfirmModal();
        if (selectedEventId) {
            try{
                closeModal();
                const token = localStorage.getItem('token');
                const response = await axios.delete(
                    baseUrl+`/api/admin/appointment/delete-appointment/${selectedEventId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    await fetchEvents();
                    console.log(
                        "Programare stearsa cu succes",
                        response.data
                    );
                } else {
                    alert("Eroare la stergerea programarii: " + response.statusText);
                }
            }
            catch (error) {
                console.error(
                    "Eroare de la server:",
                    error.response ? error.response.data : error.message
                );
                alert(
                    "Eroare la stergerea programarii: " +
                    (error.response ? error.response.data.message : error.message)
                );
            }
        }
    };

    // Funcția pentru a deschide modalul în care medicul poate adăuga programare manual
    const openManualModal = () => {
        setNewAppointment({
            patient: '',
            start: null,
            end:null,
            appointmentReason: '',
        });
        setManualModalIsOpen(true);
        setIsAddingAppointment(true);
    };


    // Setarea intervalului de ore vizibile (7:00 - 22:00)
    const minTime = new Date();
    minTime.setHours(7, 0, 0);

    const maxTime = new Date();
    maxTime.setHours(23, 0, 0);

    // Definirea formatului pentru ore în calendar
    const formats = {
        timeGutterFormat: (date, culture, localizer) =>
            localizer.format(date, 'HH:mm', culture),
        eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
        agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
    };

    const handlePatientDetailsRedirect = (patientCnp) => {
        navigate(`/GeneralAdminBoard/specific-patient`, { state: { patientCnp } });
    };

    const getPatientName =async () =>{
        const appointment = events.find(event => event.id === selectedEventId);
        if (appointment) {
            const patientCnp = appointment.patient;
            setCnpPatientForRedirection(patientCnp)
            try {
                const name = await fetchPatientNameByCnp(patientCnp); // Wait for the promise to resolve
                return name; // Return the resolved name
            } catch (error) {
                console.error('Failed to fetch patient name:', error);
                return '';
            }
        }
        return '';
    };

    useEffect(() => {
        if (modalIsOpen && selectedEventId && !isAddingAppointment) {
            const loadPatientName = async () => {
                const name = await getPatientName();
                setPatientName(name); // Update the state with the fetched name
            };
            loadPatientName(); // Call the async function
        }
    }, [modalIsOpen, selectedEventId]);




    return (
        <div>
            <h2 className={styles["patients-appointment-title"]}>Programările Pacienților</h2>

            <Calendar
                localizer={localizer}
                events={events}
                culture="ro"
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                className="bg-card p-3 rounded-lg border border-border"
                messages={{
                    next: "Înainte",
                    previous: "Înapoi",
                    today: "Azi",
                    month: "Luna",
                    week: "Săptămână",
                    day: "Zi",
                    May: "mai"
                }}
                views={['week', 'day']}
                defaultView="week"
                min={minTime}
                max={maxTime}
                formats={formats}
                selectable={true}
                onSelectSlot={openModalForNew}
                onSelectEvent={openModalForEdit}
            />

            <Dialog open={confirmationModal} onOpenChange={setConfirmationModal}>
                <DialogContent className={styles.box}>
                    <DialogHeader>
                        <DialogTitle className={styles.changeRolT}>Anulează programarea</DialogTitle>
                        <DialogDescription className={styles.text}>
                            Ești sigur că dorești să anulezi acestă programare?
                        </DialogDescription>
                    </DialogHeader>
                    <button className={styles.actionButton} onClick={()=>deleteAppointment()}>
                        Da, anulează programare
                    </button>
                    <button onClick={closeConfirmModal}>Renunță</button>
                </DialogContent>
            </Dialog>

            <Dialog open={modalIsOpen} onOpenChange={setModalIsOpen}>
                <DialogContent className={styles.modal}>
                    <DialogHeader>
                        <DialogTitle className={styles.addNewAppT}>
                            {isAddingAppointment ? 'Adaugă o nouă programare' : 'Detalii programare'}
                        </DialogTitle>
                        <DialogDescription>
                            {isAddingAppointment ? 'Selectați pacientul și motivul programării' : 'Vizualizați detaliile programării'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {isAddingAppointment ?(
                            <>
                                <div>
                                    <Label htmlFor="patient-select">Pacient</Label>
                                    <Select
                                        value={selectedPatientCNP}
                                        onValueChange={(value) => {
                                            setSelectedPatientCNP(value);
                                            setNewAppointment({ ...newAppointment, patient: value });
                                        }}
                                        disabled={!isAddingAppointment}
                                    >
                                        <SelectTrigger id="patient-select">
                                            <SelectValue placeholder="Selectează pacient" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {patients.map((patient) => (
                                                <SelectItem key={patient.patientCnp} value={patient.patientCnp}>
                                                    {`${patient.patientFirstName} ${patient.patientSecondName}(${patient.patientCnp})`}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={styles["appointmentReason"]}>
                                    <Label htmlFor="appointment-reason-select">Selectați motivul programării</Label>
                                    <select
                                        className={styles["appointment-reason-input"]}
                                        id="appointment-reason-select"
                                        required
                                        value={appointmentReason}
                                        onChange={(e) => setAppointmentReason(e.target.value)}
                                    >
                                        <option value="" disabled>
                                            Selectați motivul programării
                                        </option>
                                        <option value="consult">Consult</option>
                                        <option value="igienizare">Igienizare Profesionala</option>
                                        <option value="albire">Albire Profesionala</option>
                                        <option value="control">Control</option>
                                        <option value="extractie-dentara">Extragere dentară</option>
                                        <option value="implant-dentar">Implant dentar</option>
                                        <option value="proteza-dentara">Proteza dentară</option>
                                        <option value="fatete-dentare">Fațete dentare</option>
                                        <option value="coroana-dentara">Coroană dentară</option>
                                        <option value="aparat-dentar">Aparat dentar</option>
                                        <option value="tratament-carii">Tratament carii</option>
                                        <option value="tratament-parodontoza">Tratament parodontoză</option>
                                        <option value="gutiera-bruxism">Gutiere pentru bruxism</option>
                                    </select>
                                </div>
                            </>
                        ) : (<div className={styles.patientName}>
                            <p>Pacient:</p>
                            <button className={styles.patientNameB}
                                    onClick={() => handlePatientDetailsRedirect(cnpPatientForRedirection)}
                            >
                                {patientName}
                            </button>
                        </div>)}

                        <p>
                            Început: {moment(newAppointment.start).format('DD/MM/YYYY HH:mm')}
                        </p>
                        <p>
                            Sfârșit: {moment(newAppointment.end).format('DD/MM/YYYY HH:mm')}
                        </p>

                        {isAddingAppointment ? (
                            <button
                                onClick={addNewAppointment}
                                className={styles.addBtn}
                            >
                                Adaugă Programare
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={confirmDeleteAppointment}
                                    className={styles.cancelAppointment}
                                >
                                    Anuleaza Programare
                                </button>
                                <button
                                    onClick={closeModal}
                                    className={styles.closeModal}

                                >
                                    Închide
                                </button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={manualModalIsOpen} onOpenChange={setManualModalIsOpen}>
                <DialogContent className={styles.modal}>
                    <DialogHeader>
                        <DialogTitle className={styles.addNewAppT}>Adaugă Programare</DialogTitle>
                        <DialogDescription>Completați detaliile pentru a adăuga o programare nouă</DialogDescription>
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
                            <Label htmlFor="patient-select-manual">Pacient</Label>
                            <Select
                                value={selectedPatientCNP}
                                onValueChange={(value) => {
                                    setSelectedPatientCNP(value);
                                    setNewAppointment({ ...newAppointment, patient: value });
                                }}
                            >
                                <SelectTrigger id="patient-select-manual">
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

                        <div className={styles["appointmentReason"]}>
                            <Label htmlFor="appointment-reason-select-manual">Selectați motivul programării</Label>
                            <select
                                className={styles["appointment-reason-input"]}
                                id="appointment-reason-select-manual"
                                required
                                value={appointmentReason}
                                onChange={(e) => setAppointmentReason(e.target.value)}
                            >
                                <option value="" disabled>
                                    Selectați motivul programării
                                </option>
                                <option value="Consult">Consult</option>
                                <option value="Igienizare profesionala">Igienizare Profesionala</option>
                                <option value="Albire profesionala">Albire Profesionala</option>
                                <option value="Control">Control</option>
                                <option value="Extractie dentara">Extragere dentară</option>
                                <option value="Implant dentar">Implant dentar</option>
                                <option value="Proteza dentara">Proteza dentară</option>
                                <option value="Fatete dentare">Fațete dentare</option>
                                <option value="Coroana dentara">Coroană dentară</option>
                                <option value="Aparat dentar">Aparat dentar</option>
                                <option value="Tratament carii">Tratament carii</option>
                                <option value="Tratament parodontoză">Tratament parodontoză</option>
                                <option value="Gutiere pentru bruxism">Gutiere pentru bruxism</option>
                                <option value="Tratament de canal (endodonție)">Tratament de canal (endodonție)</option>
                            </select>
                        </div>
                        <button
                            className={styles.addBtn}
                            onClick={addNewAppointment}
                        >Adaugă Programare
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Scheduler;