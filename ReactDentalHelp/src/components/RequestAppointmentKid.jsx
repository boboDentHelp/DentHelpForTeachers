import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import styles from "../assets/css/RequestAppointmentKid.module.css";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { CalendarIcon, Pencil2Icon, TrashIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

function RequestAppointmentKid({ cnpProp }) {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [preferredTime, setPreferedTime] = useState('');
    const [timeSlots, setTimeSlots] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null);
    const [editingTime, setEditingTime] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [timeError, setTimeError] = useState('');
    const [appointmentError, setAppointmentError] = useState('');
    const [appointmentReasonMissingError, setAppointmentReasonMissingError] = useState('');
    const [appointmentReason, setAppointmentReason] = useState('');
    const navigator = useNavigate();
    const today = dayjs();
    const maxDate = today.add(1, 'month');
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    const handleAddNewTimeSlot = () => {
        const isDateAlreadySelected = timeSlots.some(slot => slot.date === selectedDate.format('DD/MM/YYYY'));

        if (isDateAlreadySelected) {
            setErrorMessage('Această dată a fost deja selectată. Alegeți o altă dată.');
            setTimeError('');
        } else if (!preferredTime) {
            setTimeError('Trebuie să specificați un interval orar.');
        } else {
            const newTimeSlot = { date: selectedDate.format('DD/MM/YYYY'), time: preferredTime };
            setTimeSlots([...timeSlots, newTimeSlot]);
            setPrefferedTime('');
            setErrorMessage('');
            setTimeError('');
        }
    };

    const handleEditTimeSlot = (index) => {
        const timeSlotToEdit = timeSlots[index];
        setEditingTime(timeSlotToEdit.time);
        setEditingIndex(index);
        setIsModalOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingTime) {
            const updatedTimeSlots = [...timeSlots];
            updatedTimeSlots[editingIndex] = { ...updatedTimeSlots[editingIndex], time: editingTime };
            setTimeSlots(updatedTimeSlots);
            setIsModalOpen(false);
        }
    };

    const handleDeleteTimeSlot = (index) => {
        const updatedTimeSlots = timeSlots.filter((_, i) => i !== index);
        setTimeSlots(updatedTimeSlots);
    };

    const shouldDisableDate = (date) => {
        const day = date.day();
        return day === 0;
    };

    const handleSendRequest = async () => {
        if (timeSlots.length === 0) {
            setAppointmentError("Trebuie să selectați cel puțin o dată.");
        } else if (!appointmentReason) {
            setAppointmentReasonMissingError("Trebuie să specificați motivul programării.");
        } else {
            setAppointmentReasonMissingError("");
            setAppointmentError("");
            const formattedTimeSlots = timeSlots
                .map(slot => `${slot.date} - ${slot.time}`)
                .join(', ');

            try {
                const token = localStorage.getItem('token');
                console.log(cnpProp)
                const response = await axios.post(
                    baseUrl+"/api/in/appointment_request",
                    {
                        appointmentReason: appointmentReason,
                        patientCnp: cnpProp,
                        desiredAppointmentTime: formattedTimeSlots
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (response.status === 200) {
                    alert(`Cerere programare trimisă: ${formattedTimeSlots}`);
                    navigator('/PatientMainPage');
                } else {
                    alert("Eroare la trimiterea cererii: " + response.statusText);
                }
            } catch (error) {
                console.error(
                    "Eroare de la server:",
                    error.response ? error.response.data : error.message
                );
                alert(
                    "Eroare la salvarea înregistrării: " +
                    (error.response ? error.response.data.message : error.message)
                );
            }
        }
    };

    return (
            <div className={styles["content"]}>
                    <div className={styles["calendar-page"]}>
                        <div className={styles["calendar-part"]}>
                            <h3 className={styles["title"]}>Selectați data în care doriți o programare</h3>
                            <Calendar
                                mode="single"
                                selected={selectedDate.toDate()}
                                onSelect={(date) => date && setSelectedDate(dayjs(date))}
                                disabled={(date) => {
                                    const dayjsDate = dayjs(date);
                                    return dayjsDate.isBefore(today, 'day') ||
                                           dayjsDate.isAfter(maxDate, 'day') ||
                                           (shouldDisableDate && shouldDisableDate(dayjsDate));
                                }}
                                className={cn("rounded-md border", styles["calendar-custom"])}
                            />
                        </div>
                    </div>
                    <div className={styles.text_part}>
                        <div className={styles['form-group']}>
                            <p className={styles.date}>Data selectată: {selectedDate.format('DD/MM/YYYY')}</p>
                            <p htmlFor="hours-input">Specificați intervalul/intervalele în care ați fi disponibil în
                                ziua
                                respectivă:</p>
                            <div className={styles["hours-input"]} id="hours-input">
                                {["08:00 - 11:00", "13:00 - 16:00", "17:00 - 20:00"].map((hour) => (
                                    <label key={hour} className={styles.labelHour}>
                                        <input
                                            type="checkbox"
                                            value={hour}
                                            className={styles.checkBox}
                                            checked={preferredTime.includes(hour)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setPreferedTime([...preferredTime, hour]);
                                                } else {
                                                    setPreferedTime(preferredTime.filter((time) => time !== hour));
                                                }
                                            }}
                                        />
                                        {hour}
                                    </label>
                                ))}
                            </div>
                            <button className={styles["add-timeslot-button"]} onClick={handleAddNewTimeSlot}>Adaugă
                            </button>
                        </div>

                        {errorMessage && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        )}
                        {timeError && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertDescription>{timeError}</AlertDescription>
                            </Alert>
                        )}

                        <div className={styles['time-slots']}>
                            <p className={styles["time-slots-title"]}>Intervale selectate:</p>
                            <ul className={styles.options}>
                                {timeSlots.map((slot, index) => (
                                    <li key={index}>
                                        <span>{slot.date} - {slot.time}</span>
                                        <Pencil2Icon className="h-5 w-5 text-cyan-600 cursor-pointer" onClick={() => handleEditTimeSlot(index)} />
                                        <TrashIcon className="h-5 w-5 text-cyan-600 cursor-pointer" onClick={() => handleDeleteTimeSlot(index)} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles["appointmentReason"]}>
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
                                <option value="durere-masea">Durere măsea</option>
                                <option value="control">Control</option>
                            </select>
                            {appointmentReasonMissingError && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertDescription>{appointmentReasonMissingError}</AlertDescription>
                                </Alert>
                            )}
                            <button onClick={handleSendRequest}>Trimite Cererea</button>
                            {appointmentError && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertDescription>{appointmentError}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                        {appointmentReasonMissingError && (
                            <Alert variant="destructive" className="mt-2">
                                <AlertDescription>{appointmentReasonMissingError}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className={styles.modalContent}>
                            <DialogHeader>
                                <DialogTitle className={styles.editT}>Editează intervalul orar</DialogTitle>
                            </DialogHeader>
                            <div className={styles["hours-input"]} id="hours-input">
                                {["08:00 - 11:00", "13:00 - 16:00", "17:00 - 20:00"].map((hourE) => (
                                    <label key={hourE}  className={styles.labelHour}>
                                        <input
                                            type="checkbox"
                                            value={hourE}
                                            className={styles.checkBox}
                                            checked={editingTime.includes(hourE)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setEditingTime([...editingTime, hourE]);
                                                } else {
                                                    setEditingTime(editingTime.filter((time1) => time1 !== hourE));
                                                }
                                            }}
                                        />
                                        {hourE}
                                    </label>
                                ))}
                            </div>

                            <div className={styles.buttons}>
                                <Button onClick={handleSaveEdit} className="mt-2">
                                    Salvează
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsModalOpen(false)}
                                    className="mt-2 ml-2"
                                >
                                    Renunță
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
            </div>
    );
}

export default RequestAppointmentKid;
