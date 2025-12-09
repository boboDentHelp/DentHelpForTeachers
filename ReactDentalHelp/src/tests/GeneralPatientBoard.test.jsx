import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeneralPatientBoard from './GeneralPatientBoard'; // Adjust the path as needed
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { act } from 'react-dom/test-utils';

// Mocking the necessary modules
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useParams: jest.fn(),
}));

const mockAxios = new MockAdapter(axios);

describe('GeneralPatientBoard', () => {
    const mockNavigate = jest.fn();
    const mockParams = { component: 'appointments' };

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useParams.mockReturnValue(mockParams);
        mockAxios.reset();
    });

    test('renders the menu and navigates on link click', async () => {
        render(
            <Router>
                <GeneralPatientBoard />
            </Router>
        );

        // Test if the component is rendered
        expect(screen.getByText(/Activitatea cabinetului/i)).toBeInTheDocument();
        expect(screen.getByText(/Programări/i)).toBeInTheDocument();
        expect(screen.getByText(/Pacienți/i)).toBeInTheDocument();

        // Simulate a link click
        fireEvent.click(screen.getByText(/Programări/i));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/GeneralAdminBoard/appointments', { replace: true });
        });
    });

    test('opens and closes the modal for adding a new appointment', async () => {
        render(
            <Router>
                <GeneralPatientBoard />
            </Router>
        );

        // Check that modal is closed initially
        expect(screen.queryByRole('dialog')).toBeNull();

        // Open the modal
        fireEvent.click(screen.getByText(/Adaugați programare/i));

        // Check if the modal is opened
        await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

        // Close the modal
        fireEvent.click(screen.getByRole('button', { name: /Adaugă Programare/i }));

        // Check if the modal is closed
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    test('fetches patients data on mount', async () => {
        const mockPatients = [
            { patientFirstName: 'John', patientSecondName: 'Doe', patientCnp: '12345' },
            { patientFirstName: 'Jane', patientSecondName: 'Smith', patientCnp: '67890' }
        ];

        mockAxios.onGet('http://localhost:8080/api/admin/patient/get-patients').reply(200, {
            data: mockPatients
        });

        render(
            <Router>
                <GeneralPatientBoard />
            </Router>
        );

        // Simulate the component's first render
        await waitFor(() => {
            expect(screen.getByText(/John Doe \(12345\)/)).toBeInTheDocument();
            expect(screen.getByText(/Jane Smith \(67890\)/)).toBeInTheDocument();
        });
    });

    test('handles the modal form submission for a new appointment', async () => {
        const mockCreateAppointmentResponse = { status: 200, data: { id: 1 } };
        mockAxios.onPost('http://localhost:8080/api/admin/appointment/make-appointment').reply(200, mockCreateAppointmentResponse);

        render(
            <Router>
                <GeneralPatientBoard />
            </Router>
        );

        // Open the modal to add a new appointment
        fireEvent.click(screen.getByText(/Adaugați programare/i));

        // Simulate input changes
        fireEvent.change(screen.getByLabelText(/Pacient/i), { target: { value: '12345' } });
        fireEvent.change(screen.getByLabelText(/Selectați motivul programării/i), { target: { value: 'consult' } });
        fireEvent.change(screen.getByLabelText(/Data și ora de început/i), { target: { value: '01/01/2025 10:00' } });
        fireEvent.change(screen.getByLabelText(/Data și ora de sfârșit/i), { target: { value: '01/01/2025 11:00' } });

        // Simulate form submission
        fireEvent.click(screen.getByText(/Adaugă Programare/i));

        // Verify if the new appointment was successfully created
        await waitFor(() => expect(mockAxios.history.post.length).toBe(1));
        expect(mockAxios.history.post[0].data).toContain('consult');
    });

    test('handles logout button click', () => {
        const mockNavigate = jest.fn();
        localStorage.setItem("token", "some-token");

        render(
            <Router>
                <GeneralPatientBoard />
            </Router>
        );

        // Click the logout button
        fireEvent.click(screen.getByText(/Deconectare/i));

        // Verify that the token is removed from local storage
        expect(localStorage.getItem('token')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
