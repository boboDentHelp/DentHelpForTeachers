import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterNewUser from './RegisterNewUser'; // Import the component
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock axios to prevent actual HTTP requests
const mock = new MockAdapter(axios);

describe('RegisterNewUser', () => {

    beforeEach(() => {
        // Reset mocks before each test
        mock.reset();
    });

    test('should render the registration form correctly', () => {
        render(<RegisterNewUser />);

        // Check that form elements are rendered
        expect(screen.getByPlaceholderText('Nume')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Prenume')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('CNP')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Adresa e-mail')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Parola')).toBeInTheDocument();
    });

    test('should change role when radio buttons are clicked', () => {
        render(<RegisterNewUser />);

        const patientRadio = screen.getByLabelText(/Pacient/i);
        const radiologistRadio = screen.getByLabelText(/Radiolog/i);

        // Default role should be empty
        expect(patientRadio.checked).toBe(false);
        expect(radiologistRadio.checked).toBe(false);

        // Click the "Pacient" radio button
        fireEvent.click(patientRadio);
        expect(patientRadio.checked).toBe(true);
        expect(radiologistRadio.checked).toBe(false);

        // Click the "Radiolog" radio button
        fireEvent.click(radiologistRadio);
        expect(patientRadio.checked).toBe(false);
        expect(radiologistRadio.checked).toBe(true);
    });

    test('should call the API to create a new user when form is submitted', async () => {
        render(<RegisterNewUser />);

        // Mock the API response
        mock.onPost('http://localhost:8080/api/admin/patient/addPatient').reply(200, {});

        // Fill out the form
        fireEvent.change(screen.getByPlaceholderText('Nume'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Prenume'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('CNP'), { target: { value: '123456789' } });
        fireEvent.change(screen.getByPlaceholderText('Adresa e-mail'), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Parola'), { target: { value: 'password123' } });

        // Select the "Pacient" role
        fireEvent.click(screen.getByLabelText(/Pacient/i));

        // Submit the form
        fireEvent.click(screen.getByText(/Crează Cont/i));

        // Wait for the success message (InfoBox to appear)
        await waitFor(() => {
            expect(screen.getByText(/Utilizatorul a fost adaugat cu succes/i)).toBeInTheDocument();
        });
    });

    test('should show an error message when API call fails', async () => {
        render(<RegisterNewUser />);

        // Mock the API error response
        mock.onPost('http://localhost:8080/api/admin/patient/addPatient').reply(500, { message: 'Internal Server Error' });

        // Fill out the form
        fireEvent.change(screen.getByPlaceholderText('Nume'), { target: { value: 'John' } });
        fireEvent.change(screen.getByPlaceholderText('Prenume'), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByPlaceholderText('CNP'), { target: { value: '123456789' } });
        fireEvent.change(screen.getByPlaceholderText('Adresa e-mail'), { target: { value: 'john.doe@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Parola'), { target: { value: 'password123' } });

        // Select the "Pacient" role
        fireEvent.click(screen.getByLabelText(/Pacient/i));

        // Submit the form
        fireEvent.click(screen.getByText(/Crează Cont/i));

        // Wait for the error message (InfoBox to appear)
        await waitFor(() => {
            expect(screen.getByText(/Internal Server Error/i)).toBeInTheDocument();
        });
    });

    test('should show the modal when clicking on the change role arrow', () => {
        render(<RegisterNewUser />);

        // Mock data for radiologists
        const radiologist = {
            id: 1,
            firstName: 'Jane',
            lastName: 'Doe',
            cnp: '123456789',
            userRole: 'RADIOLOGIST'
        };

        // Mock the patients and radiologists lists
        mock.onGet('http://localhost:8080/api/admin/patient/get-patients').reply(200, {
            data: [radiologist]
        });

        // Simulate clicking the "Radiolog" tab
        fireEvent.click(screen.getByText(/Radiologi/i));

        // Check if the radiologist card is displayed
        const radiologistCard = screen.getByText(/Jane Doe/i);
        fireEvent.click(radiologistCard);

        // Check if the modal appears after clicking the arrow
        const arrowIcon = screen.getByAltText('Jane Doe');
        fireEvent.click(arrowIcon);

        // Check if the modal is visible
        expect(screen.getByText(/Schimbare Rol Utilizator/i)).toBeInTheDocument();
    });

    test('should close the modal when close button is clicked', () => {
        render(<RegisterNewUser />);

        // Simulate clicking the "Radiolog" tab
        fireEvent.click(screen.getByText(/Radiologi/i));

        // Check if the modal appears after clicking the arrow
        const arrowIcon = screen.getByAltText('Jane Doe');
        fireEvent.click(arrowIcon);

        // Close the modal
        const closeButton = screen.getByText(/Închide/i);
        fireEvent.click(closeButton);

        // Ensure modal is closed
        expect(screen.queryByText(/Schimbare Rol Utilizator/i)).not.toBeInTheDocument();
    });

});

