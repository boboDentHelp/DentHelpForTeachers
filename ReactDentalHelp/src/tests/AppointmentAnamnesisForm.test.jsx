// src/__tests__/AppointmentAnamnesisForm.test.jsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AppointmentAnamnesisForm from '../components/AppointmentAnamnesisForm';
import axios from 'axios';
import React from 'react';

// Simulăm axios și localStorage
jest.mock('axios');

beforeEach(() => {
    localStorage.setItem('token', 'test-token');
});

afterEach(() => {
    jest.clearAllMocks();
});

test('renders the component and shows the toggle button', () => {
    render(<AppointmentAnamnesisForm appointmentId={1} appointmentReason="Control" />);
    const button = screen.getByText('Anamneza Programării');
    expect(button).toBeInTheDocument();
});

test('toggles the form when clicking the button', () => {
    render(<AppointmentAnamnesisForm appointmentId={1} appointmentReason="Control" />);
    const toggleBtn = screen.getByText('Anamneza Programării');
    fireEvent.click(toggleBtn);
    expect(screen.getByPlaceholderText('scrieți răspunsul')).toBeInTheDocument();
});

test('fetches and displays existing anamnesis data', async () => {
    axios.get.mockResolvedValueOnce({
        status: 200,
        data: {
            data: {
                currentMedication: 'Paracetamol',
                recentMedication: 'Ibuprofen',
                currentSymptoms: 'Durere de dinți',
                pregnancy: false,
            },
        },
    });

    render(<AppointmentAnamnesisForm appointmentId={123} appointmentReason="Control" />);
    fireEvent.click(screen.getByText('Anamneza Programării'));

    await waitFor(() => {
        expect(screen.getByText(/Paracetamol/)).toBeInTheDocument();
        expect(screen.getByText(/Ibuprofen/)).toBeInTheDocument();
        expect(screen.getByText(/Durere de dinți/)).toBeInTheDocument();
        expect(screen.getByText(/nu/)).toBeInTheDocument();
    });
});

test('saves new anamnesis data', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: null } });
    axios.post.mockResolvedValueOnce({ status: 200 });

    render(<AppointmentAnamnesisForm appointmentId={321} appointmentReason="Consultatie" />);
    fireEvent.click(screen.getByText('Anamneza Programării'));

    fireEvent.change(screen.getByPlaceholderText('scrieți răspunsul'), {
        target: { value: 'Aspirina' },
    });
    fireEvent.change(screen.getByPlaceholderText('scrie răspunsul'), {
        target: { value: 'Antibiotic' },
    });
    fireEvent.click(screen.getByLabelText('Da'));

    fireEvent.click(screen.getByText('Salvează Anamneza'));

    await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('saveAppointmentAnamnesis'),
            expect.objectContaining({
                appointmentId: 321,
                appointmentReason: 'Consultatie',
                currentMedication: 'Aspirina',
                recentMedication: 'Antibiotic',
                currentSymptoms: '',
                pregnancy: true,
            }),
            expect.any(Object)
        );
    });
});
