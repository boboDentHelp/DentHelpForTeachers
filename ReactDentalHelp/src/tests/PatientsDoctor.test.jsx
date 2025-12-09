import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientsDoctor from '../components/PatientsDoctor';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// Mocks
jest.mock('axios');
jest.mock('../components/PatientsDoctorComponents/PatientPersonalData', () => ({ cnp }) => <div>PersonalData {cnp}</div>);
jest.mock('../components/PatientsDoctorComponents/PatientGeneralAnamnesis', () => ({ cnp }) => <div>Anamnesis {cnp}</div>);
jest.mock('../components/PatientsDoctorComponents/PatientAppointmentsForDoctor', () => ({ cnp }) => <div>Appointments {cnp}</div>);
jest.mock('../components/PatientsDoctorComponents/PatientRadiography', () => ({ cnp }) => <div>Radiography {cnp}</div>);
jest.mock('../components/PatientsDoctorComponents/PatientStatus', () => ({ cnp }) => <div>Status {cnp}</div>);
jest.mock('../components/NavBar', () => () => <div>MockNavBar</div>);

beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => 'mocked-token');
});

describe('PatientsDoctor', () => {
    const mockPatients = [
        { id: 1, firstName: 'Ion', lastName: 'Popescu', cnp: '123' },
        { id: 2, firstName: 'Maria', lastName: 'Ionescu', cnp: '456' },
    ];

    it('afișează lista de pacienți după fetch', async () => {
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

    it('filtrează pacienții după căutare', async () => {
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

    it('afișează date personale la selectarea unui pacient', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: mockPatients } });

        render(
            <MemoryRouter>
                <PatientsDoctor />
            </MemoryRouter>
        );

        await waitFor(() => {
            fireEvent.click(screen.getByText('Maria Ionescu'));
        });

        expect(screen.getByText('PersonalData 456')).toBeInTheDocument();
    });

    it('comută corect între tab-uri', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: mockPatients } });

        render(
            <MemoryRouter>
                <PatientsDoctor />
            </MemoryRouter>
        );

        await waitFor(() => {
            fireEvent.click(screen.getByText('Ion Popescu'));
        });

        expect(screen.getByText('PersonalData 123')).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Anamneza generală/i));
        expect(screen.getByText('Anamnesis 123')).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Programările pacientului/i));
        expect(screen.getByText('Appointments 123')).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Radiografii/i));
        expect(screen.getByText('Radiography 123')).toBeInTheDocument();

        fireEvent.click(screen.getByText(/Status/i));
        expect(screen.getByText('Status 123')).toBeInTheDocument();
    });

    it('afișează tab-ul 0 automat dacă pacientul este trimis prin location.state', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: mockPatients } });

        render(
            <MemoryRouter initialEntries={[{ pathname: '/', state: { patientCnp: '456' } }]}>
                <PatientsDoctor />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('PersonalData 456')).toBeInTheDocument();
        });
    });
});
