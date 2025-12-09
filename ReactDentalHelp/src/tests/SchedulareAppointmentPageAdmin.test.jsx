import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SchedulareAppointmentsPageAdmin from './SchedulareAppointmentsPageAdmin';
import axios from 'axios';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

// Mocking Axios
jest.mock('axios');

// Mocking `localStorage`
beforeAll(() => {
    global.localStorage.setItem('token', 'fake-token');
});

describe('SchedulareAppointmentsPageAdmin Component', () => {
    it('should render the component correctly', () => {
        render(<SchedulareAppointmentsPageAdmin />);

        expect(screen.getByText(/Scheduler/i)).toBeInTheDocument();
        expect(screen.getByText(/Solicitari Programări/i)).toBeInTheDocument();
        expect(screen.getByText(/Adaugă Programare/i)).toBeInTheDocument();
        expect(screen.getByText(/Notificări/i)).toBeInTheDocument();
    });

    it('should open the modal when "Adaugă Programare" button is clicked', () => {
        render(<SchedulareAppointmentsPageAdmin />);

        const addAppointmentButton = screen.getByText(/Adaugă Programare/i);
        fireEvent.click(addAppointmentButton);

        // Check if modal is open by checking for a modal header
        expect(screen.getByText(/Adaugă Programare/i)).toBeInTheDocument();
    });

    it('should fetch patients from API and show them in the select dropdown', async () => {
        // Mocking the API response
        axios.get.mockResolvedValue({
            data: {
                data: [
                    { firstName: 'John', lastName: 'Doe', cnp: '1234567890' },
                    { firstName: 'Jane', lastName: 'Doe', cnp: '9876543210' },
                ]
            }
        });

        render(<SchedulareAppointmentsPageAdmin />);

        // Wait for the component to finish loading the patients
        await waitFor(() => screen.getByText(/John Doe/));

        expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
        expect(screen.getByText(/Jane Doe/i)).toBeInTheDocument();
    });

    it('should allow selecting a patient from the dropdown', async () => {
        // Mocking the API response
        axios.get.mockResolvedValue({
            data: {
                data: [
                    { firstName: 'John', lastName: 'Doe', cnp: '1234567890' },
                ]
            }
        });

        render(<SchedulareAppointmentsPageAdmin />);

        await waitFor(() => screen.getByText(/John Doe/i));

        const patientSelect = screen.getByLabelText(/Pacient/i);
        fireEvent.change(patientSelect, { target: { value: '1234567890' } });

        expect(patientSelect.value).toBe('1234567890');
    });

    it('should update the state when date and time are selected', async () => {
        render(<SchedulareAppointmentsPageAdmin />);

        const addAppointmentButton = screen.getByText(/Adaugă Programare/i);
        fireEvent.click(addAppointmentButton);

        // Check if DateTimePicker is rendered
        expect(screen.getByLabelText(/Data și ora de început/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Data și ora de sfârșit/i)).toBeInTheDocument();

        // Simulate selecting a start and end time (using the Moment library format)
        const startDateTime = screen.getByLabelText(/Data și ora de început/i);
        fireEvent.change(startDateTime, { target: { value: '05/04/2025 10:00' } });

        const endDateTime = screen.getByLabelText(/Data și ora de sfârșit/i);
        fireEvent.change(endDateTime, { target: { value: '05/04/2025 12:00' } });

        expect(startDateTime.value).toBe('05/04/2025 10:00');
        expect(endDateTime.value).toBe('05/04/2025 12:00');
    });

    it('should handle adding a new appointment', async () => {
        // Mocking the API response for creating an appointment
        axios.post.mockResolvedValue({
            status: 200,
            data: { message: 'Appointment created successfully' }
        });

        render(<SchedulareAppointmentsPageAdmin />);

        // Open the modal
        const addAppointmentButton = screen.getByText(/Adaugă Programare/i);
        fireEvent.click(addAppointmentButton);

        await waitFor(() => screen.getByText(/Adaugă Programare/i));

        // Select a patient and fill out the form
        fireEvent.change(screen.getByLabelText(/Pacient/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Motiv/i), { target: { value: 'Consult' } });
        fireEvent.change(screen.getByLabelText(/Data și ora de început/i), { target: { value: '05/04/2025 10:00' } });
        fireEvent.change(screen.getByLabelText(/Data și ora de sfârșit/i), { target: { value: '05/04/2025 12:00' } });

        const addButton = screen.getByText(/Adaugă Programare/i);
        fireEvent.click(addButton);

        // Check if the API call was made
        await waitFor(() => expect(axios.post).toHaveBeenCalledWith(
            'http://localhost:8080/api/admin/appointment/make-appointment',
            expect.objectContaining({
                appointmentReason: 'Consult',
                patientCnp: '1234567890',
                date: '05/04/2025 10:00',
                hour: '05/04/2025 12:00'
            })
        ));
    });

    it('should show error when there is an API error for adding appointment', async () => {
        // Mocking the API error
        axios.post.mockRejectedValue(new Error('Failed to create appointment'));

        render(<SchedulareAppointmentsPageAdmin />);

        // Open the modal
        const addAppointmentButton = screen.getByText(/Adaugă Programare/i);
        fireEvent.click(addAppointmentButton);

        await waitFor(() => screen.getByText(/Adaugă Programare/i));

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/Pacient/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/Motiv/i), { target: { value: 'Consult' } });
        fireEvent.change(screen.getByLabelText(/Data și ora de început/i), { target: { value: '05/04/2025 10:00' } });
        fireEvent.change(screen.getByLabelText(/Data și ora de sfârșit/i), { target: { value: '05/04/2025 12:00' } });

        const addButton = screen.getByText(/Adaugă Programare/i);
        fireEvent.click(addButton);

        // Check if error alert is shown
        await waitFor(() => expect(screen.getByText(/Eroare la salvarea programarii/)).toBeInTheDocument());
    });
});
