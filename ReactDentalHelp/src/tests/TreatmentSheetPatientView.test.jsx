import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TreatmentSheetPatientView from './TreatmentSheetPatientView';
import axios from 'axios';
import '@testing-library/jest-dom';
import { act } from 'react-dom/test-utils';

// Mocking Axios
jest.mock('axios');

describe('TreatmentSheetPatientView Component', () => {
    const appointmentId = 1;

    beforeAll(() => {
        global.localStorage.setItem('token', 'fake-token');
    });

    it('should render the component correctly', () => {
        render(<TreatmentSheetPatientView appointmentId={appointmentId} />);

        // Check if the button to toggle the treatment sheet form is present
        expect(screen.getByText(/Fișa Tratament/i)).toBeInTheDocument();
    });

    it('should fetch data on mount and display treatment information', async () => {
        const mockData = {
            appointmentObservations: 'Patient observed well during appointment.',
            medication: 'Paracetamol 500mg',
            recommendations: 'Take rest and drink plenty of water.',
        };

        // Mocking the API response
        axios.get.mockResolvedValue({
            status: 200,
            data: { data: mockData }
        });

        render(<TreatmentSheetPatientView appointmentId={appointmentId} />);

        // Wait for the component to finish loading data
        await waitFor(() => screen.getByText(/Observațile programarii:/));

        // Check if the fetched data is rendered
        expect(screen.getByText(/Observațile programarii:/)).toHaveTextContent(mockData.appointmentObservations);
        expect(screen.getByText(/Tratement medical:/)).toHaveTextContent(mockData.medication);
        expect(screen.getByText(/Recomandari post tratament:/)).toHaveTextContent(mockData.recommendations);
    });

    it('should show an info message when no treatment sheet is available', async () => {
        // Simulate no treatment data
        axios.get.mockResolvedValue({
            status: 200,
            data: { data: {} }
        });

        render(<TreatmentSheetPatientView appointmentId={appointmentId} />);

        // Wait for the component to load and check for the info message
        await waitFor(() => screen.getByText(/Este posibil ca medicul să nu fi completat încă fișa de tratament/i));

        expect(screen.getByText(/Este posibil ca medicul să nu fi completat încă fișa de tratament/i)).toBeInTheDocument();
    });

    it('should toggle the treatment sheet form visibility on button click', async () => {
        render(<TreatmentSheetPatientView appointmentId={appointmentId} />);

        // The treatment sheet form should be initially hidden
        expect(screen.queryByText(/Observațile programarii:/)).not.toBeInTheDocument();

        // Click to toggle visibility
        const toggleButton = screen.getByText(/Fișa Tratament/i);
        fireEvent.click(toggleButton);

        // The treatment sheet form should now be visible
        expect(screen.getByText(/Observațile programarii:/)).toBeInTheDocument();

        // Click again to hide the form
        fireEvent.click(toggleButton);

        // The treatment sheet form should now be hidden again
        expect(screen.queryByText(/Observațile programarii:/)).not.toBeInTheDocument();
    });

    it('should handle API error gracefully', async () => {
        // Simulating an API error
        axios.get.mockRejectedValue(new Error('Failed to fetch treatment sheet data'));

        render(<TreatmentSheetPatientView appointmentId={appointmentId} />);

        // Wait for the component to handle the error
        await waitFor(() => expect(screen.queryByText(/Observațile programarii:/)).not.toBeInTheDocument());
    });
});
