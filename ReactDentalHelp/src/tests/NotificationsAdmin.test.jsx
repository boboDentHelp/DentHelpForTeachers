import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import NotificationsAdmin from '../components/NotificationsAdmin';
import axios from 'axios';
import { BrowserRouter } from 'react-router-dom';

jest.mock('axios');
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

jest.mock('../components/InfoBox', () => ({ message, onClose }) => (
    <div data-testid="infobox">
        <p>{message}</p>
        <button onClick={onClose}>Close</button>
    </div>
));

describe('NotificationsAdmin', () => {
    const sampleNotification = {
        notificationId: 1,
        patientCnp: '1234567890123',
        notificationType: 'CANCEL_APPOINTMENT',
        date: '2025-05-03 14:30:00',
        notificationStatus: 'NEW',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.setItem('token', 'fake-token');
    });

    it('renderizează mesajul când nu sunt notificări', async () => {
        axios.get.mockResolvedValue({ status: 200, data: { data: [] } });

        render(<NotificationsAdmin />, { wrapper: BrowserRouter });

        await waitFor(() => {
            expect(screen.getByText('Nu există notificari')).toBeInTheDocument();
        });
    });

    it('afișează notificări primite din API', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('get_notifications')) {
                return Promise.resolve({ status: 200, data: { data: [sampleNotification] } });
            }
            if (url.includes('get-patient-personal-data')) {
                return Promise.resolve({
                    status: 200,
                    data: { data: { firstName: 'Ion', lastName: 'Popescu' } },
                });
            }
        });

        render(<NotificationsAdmin />, { wrapper: BrowserRouter });

        expect(await screen.findByText('PROGRAMARE ANULATĂ')).toBeInTheDocument();
        expect(screen.getByText('Ora:14:30:00')).toBeInTheDocument();
        expect(screen.getByText('Data:2025-05-03')).toBeInTheDocument();
    });

    it('șterge notificarea și afișează InfoBox', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { data: [sampleNotification] } });
        axios.get.mockResolvedValueOnce({ status: 200, data: { data: { firstName: 'Ion', lastName: 'Popescu' } } });
        axios.delete.mockResolvedValue({ status: 200 });

        render(<NotificationsAdmin />, { wrapper: BrowserRouter });

        const deleteIcon = await screen.findByAltText('delete');
        fireEvent.click(deleteIcon);

        await waitFor(() => {
            expect(screen.getByTestId('infobox')).toBeInTheDocument();
            expect(screen.getByText('Notificarea a fost ștearsă')).toBeInTheDocument();
        });
    });

    it('marchează notificarea ca citită și afișează InfoBox', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { data: [sampleNotification] } });
        axios.get.mockResolvedValueOnce({ status: 200, data: { data: { firstName: 'Ion', lastName: 'Popescu' } } });
        axios.put.mockResolvedValue({ status: 200 });

        render(<NotificationsAdmin />, { wrapper: BrowserRouter });

        const readIcon = await screen.findByAltText('read');
        fireEvent.click(readIcon);

        await waitFor(() => {
            expect(screen.getByText('Statusul notificării a fost schimbat')).toBeInTheDocument();
        });
    });

    it('navighează la pagina pacientului când este apăsat numele', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { data: [sampleNotification] } });
        axios.get.mockResolvedValueOnce({ status: 200, data: { data: { firstName: 'Ion', lastName: 'Popescu' } } });

        render(<NotificationsAdmin />, { wrapper: BrowserRouter });

        // Deschide submeniul
        const arrow = await screen.findByAltText('Mai mult');
        fireEvent.click(arrow);

        // Click pe numele pacientului
        const patientButton = await screen.findByText('Ion Popescu');
        fireEvent.click(patientButton);

        expect(mockedNavigate).toHaveBeenCalledWith('/GeneralAdminBoard/specific-patient', {
            state: { patientCnp: '1234567890123' },
        });
    });
});
