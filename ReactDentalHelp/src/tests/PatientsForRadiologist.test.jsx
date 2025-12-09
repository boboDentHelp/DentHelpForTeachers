import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientsDoctor from '../components/PatientsDoctor';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// Mocks
jest.mock('axios');
jest.mock('../components/PatientsDoctorComponents/PatientRadiography', () => ({ cnp }) => <div>Radiography {cnp}</div>);
jest.mock('../components/NavBar', () => () => <div>MockNavBar</div>);

beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => 'mocked-token');
});

describe('PatientsDoctor', () => {
    const mockPatients = [
        { id: 1, firstName: 'Ion', lastName: 'Popescu', cnp: '123' },
        { id: 2, firstName: 'Maria', lastName: 'Ionescu', cnp: '456' },
    ];

    it('fetch pacienți și le afișează corect', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: mockPatients } });

        render(
            <MemoryRouter>
                <PatientsDoctor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ion Popescu')).toBeInTheDocument();
            expect(screen.getByText('Maria Ionescu')).toBeInTheDocument();
        });
    });

    it('filtrează pacienții corect după căutare', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: mockPatients } });

        render(
            <MemoryRouter>
                <PatientsDoctor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Ion Popescu')).toBeInTheDocument();
        });

        fireEvent.change(screen.getByPlaceholderText(/Caută pacient/i), {
            target: { value: 'Maria' },
        });

        expect(screen.queryByText('Ion Popescu')).not.toBeInTheDocument();
        expect(screen.getByText('Maria Ionescu')).toBeInTheDocument();
    });

    it('selectează un pacient și afișează radiografiile acestuia', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: mockPatients } });

        render(
            <MemoryRouter>
                <PatientsDoctor />
            </MemoryRouter>
        );

        await waitFor(() => {
            fireEvent.click(screen.getByText('Maria Ionescu'));
        });

        expect(screen.getByText('Radiography 456')).toBeInTheDocument();
    });

    it('afișează un mesaj dacă niciun pacient nu este selectat', () => {
        render(
            <MemoryRouter>
                <PatientsDoctor />
            </MemoryRouter>
        );

        expect(screen.getByText('Selectează un pacient pentru a vedea detaliile acestuia.')).toBeInTheDocument();
    });

    it('gestionează erorile de fetch', async () => {
        axios.get.mockRejectedValueOnce(new Error('Server error'));

        render(
            <MemoryRouter>
                <PatientsDoctor />
            </MemoryRouter>
        );

        // We expect that no patient is displayed if the fetch fails
        await waitFor(() => {
            expect(screen.queryByText('Ion Popescu')).not.toBeInTheDocument();
            expect(screen.queryByText('Maria Ionescu')).not.toBeInTheDocument();
        });
    });
});
