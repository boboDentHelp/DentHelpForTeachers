import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RequestAppointmentKid from './RequestAppointmentKid'; // adaptează la calea fișierului
import axios from 'axios';
import { BrowserRouter as Router } from 'react-router-dom'; // pentru a folosi useNavigate

jest.mock('axios'); // Mock pentru axios

describe('RequestAppointmentKid', () => {
    it('should render correctly', () => {
        render(
            <Router>
                <RequestAppointmentKid cnpProp="1234567890123" />
            </Router>
        );

        // Verifică dacă titlul este afisat corect
        expect(screen.getByText(/Selectați data în care doriți o programare/i)).toBeInTheDocument();
        // Verifică dacă inputurile pentru ora sunt afisate
        expect(screen.getByLabelText(/08:00 - 11:00/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/13:00 - 16:00/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/17:00 - 20:00/i)).toBeInTheDocument();
    });

    it('should show error message when no time slot is selected', () => {
        render(
            <Router>
                <RequestAppointmentKid cnpProp="1234567890123" />
            </Router>
        );

        fireEvent.click(screen.getByText(/Adaugă/i));
        expect(screen.getByText(/Trebuie să specificați un interval orar./i)).toBeInTheDocument();
    });

    it('should add a new time slot correctly', () => {
        render(
            <Router>
                <RequestAppointmentKid cnpProp="1234567890123" />
            </Router>
        );

        fireEvent.click(screen.getByLabelText(/08:00 - 11:00/i)); // Selectează ora
        fireEvent.click(screen.getByText(/Adaugă/i)); // Apasă butonul pentru a adăuga

        expect(screen.getByText('08:00 - 11:00')).toBeInTheDocument(); // Verifică dacă intervalul a fost adăugat
    });

    it('should show error when trying to add a duplicate date', () => {
        render(
            <Router>
                <RequestAppointmentKid cnpProp="1234567890123" />
            </Router>
        );

        fireEvent.click(screen.getByLabelText(/08:00 - 11:00/i)); // Selectează ora
        fireEvent.click(screen.getByText(/Adaugă/i)); // Adaugă intervalul

        // Adaugă aceeași dată din nou
        fireEvent.click(screen.getByLabelText(/08:00 - 11:00/i));
        fireEvent.click(screen.getByText(/Adaugă/i));

        // Verifică dacă apare eroare pentru data duplicată
        expect(screen.getByText(/Această dată a fost deja selectată. Alegeți o altă dată./i)).toBeInTheDocument();
    });

    it('should send the appointment request correctly', async () => {
        render(
            <Router>
                <RequestAppointmentKid cnpProp="1234567890123" />
            </Router>
        );

        fireEvent.click(screen.getByLabelText(/08:00 - 11:00/i)); // Selectează ora
        fireEvent.click(screen.getByText(/Adaugă/i)); // Adaugă intervalul
        fireEvent.change(screen.getByLabelText(/Selectați motivul programării/i), { target: { value: 'consult' } });

        axios.post.mockResolvedValue({ status: 200 }); // Mock la răspunsul de succes al cererii

        fireEvent.click(screen.getByText(/Trimite Cererea/i));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8080/api/in/appointment_request',
                expect.objectContaining({
                    appointmentReason: 'consult',
                    cnp: '1234567890123',
                    desiredAppointmentTime: '08:00 - 11:00'
                }),
                expect.objectContaining({
                    headers: {
                        Authorization: 'Bearer ' + localStorage.getItem('token')
                    }
                })
            );
        });
    });

    it('should show error if appointment reason is not selected', async () => {
        render(
            <Router>
                <RequestAppointmentKid cnpProp="1234567890123" />
            </Router>
        );

        fireEvent.click(screen.getByLabelText(/08:00 - 11:00/i)); // Selectează ora
        fireEvent.click(screen.getByText(/Adaugă/i)); // Adaugă intervalul

        fireEvent.click(screen.getByText(/Trimite Cererea/i));

        // Verifică dacă apare eroarea pentru motivul programării
        expect(screen.getByText(/Trebuie să specificați motivul programării./i)).toBeInTheDocument();
    });
});
