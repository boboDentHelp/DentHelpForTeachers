// src/__tests__/CabActivity.test.jsx

import { render, screen, waitFor } from '@testing-library/react';
import CabActivity from '../components/CabActivity';
import axios from 'axios';
import React from 'react';

jest.mock('axios');

beforeEach(() => {
    localStorage.setItem('token', 'test-token');
});

afterEach(() => {
    jest.clearAllMocks();
});

test('renders CabActivity component and titles', async () => {
    axios.get.mockResolvedValueOnce({ data: { data: [] } }); // patients
    axios.get.mockResolvedValueOnce({ data: { data: [] } }); // appointments

    render(<CabActivity />);

    expect(screen.getByText(/Activitatea Cabinetului/)).toBeInTheDocument();
    expect(screen.getByText(/Tipul serviciului/)).toBeInTheDocument();
    expect(screen.getByText(/Detalii pacienți/)).toBeInTheDocument();

    await waitFor(() => {
        expect(axios.get).toHaveBeenCalledTimes(2);
    });
});

test('displays patient counts based on mock data', async () => {
    const mockPatients = [
        { cnp: '123', parent: null },
        { cnp: '456', parent: '111' }, // copil
        { cnp: '789', parent: '111' }, // copil
    ];
    const mockAppointments = [
        { patientCnp: '123', date: '01/04/2024 12:00', appointmentReason: 'Consultatie' },
        { patientCnp: '456', date: '02/04/2024 12:00', appointmentReason: 'Control' },
    ];

    axios.get.mockImplementation((url) => {
        if (url.includes('get-patients')) {
            return Promise.resolve({ data: { data: mockPatients } });
        }
        if (url.includes('get-appointments')) {
            return Promise.resolve({ data: { data: mockAppointments } });
        }
    });

    render(<CabActivity />);

    await waitFor(() => {
        expect(screen.getByText('Număr total de pacienți')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument(); // total
        expect(screen.getByText('Copii')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // copii
        expect(screen.getByText('Adulți')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument(); // adult
        expect(screen.getByText('Pacienți cu cel puțin o programare')).toBeInTheDocument();
    });
});
