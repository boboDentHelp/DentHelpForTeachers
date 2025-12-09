import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientPersonalData from '../components/PatientPersonalData';
import '@testing-library/jest-dom';
import axios from 'axios';

// Mocks
jest.mock('axios');
jest.mock('../service/authService.jsx', () => ({
    parseJwt: jest.fn(() => ({ cnp: '1234567890123' })),
}));
jest.mock('../components/NavBar.jsx', () => () => <div>MockNavBar</div>);

// Mock localStorage
beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => 'mocked-token');
});

describe('PatientPersonalData', () => {
    it('afișează titlul și mesajul informativ', async () => {
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    addressStreet: 'Str. Test',
                    addressNumber: '10',
                    addressCountry: 'Romania',
                    addressRegion: 'Bucuresti',
                    phoneNumber: '0712345678',
                    sex: 'male',
                }
            }
        });

        render(<PatientPersonalData />);

        expect(screen.getByText('Date Personale')).toBeInTheDocument();
        expect(screen.getByText(/completați informațiile/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Strada:/)).toBeInTheDocument();
            expect(screen.getByText(/Telefon:/)).toBeInTheDocument();
        });
    });

    it('permite trecerea în modul editare și modificarea valorilor', async () => {
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    addressStreet: 'Str. Veche',
                    addressNumber: '22',
                    addressCountry: 'Romania',
                    addressRegion: 'Cluj',
                    phoneNumber: '0711222333',
                    sex: 'female',
                }
            }
        });

        render(<PatientPersonalData />);

        await waitFor(() => {
            expect(screen.getByText('Editare Date')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Editare Date'));

        const input = screen.getByLabelText(/Strada:/i);
        fireEvent.change(input, { target: { value: 'Str. Nouă' } });
        expect(input.value).toBe('Str. Nouă');
    });

    it('apelează API-ul corect la salvare pentru update', async () => {
        axios.get.mockResolvedValueOnce({
            status: 200,
            data: {
                data: {
                    addressStreet: 'Str. Veche',
                    addressNumber: '22',
                    addressCountry: 'Romania',
                    addressRegion: 'Cluj',
                    phoneNumber: '0711222333',
                    sex: 'female',
                }
            }
        });

        axios.put.mockResolvedValueOnce({ status: 200 });

        render(<PatientPersonalData />);

        await waitFor(() => {
            expect(screen.getByText('Editare Date')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Editare Date'));

        fireEvent.change(screen.getByLabelText(/Telefon:/i), {
            target: { value: '0777888999' }
        });

        fireEvent.click(screen.getByText('Salvează Modificările'));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/update-personal-data'),
                expect.objectContaining({ phoneNumber: '0777888999' }),
                expect.any(Object)
            );
        });
    });

    it('apelează API-ul corect la salvare pentru creare date noi', async () => {
        axios.get.mockResolvedValueOnce({ status: 200, data: { data: null } });
        axios.post.mockResolvedValueOnce({ status: 201 });

        render(<PatientPersonalData />);

        await waitFor(() => {
            expect(screen.getByText('Completare Date')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText('Completare Date'));

        fireEvent.change(screen.getByLabelText(/Strada:/i), { target: { value: 'Nouă' } });
        fireEvent.change(screen.getByLabelText(/Număr:/i), { target: { value: '5' } });
        fireEvent.change(screen.getByLabelText(/Localitate:/i), { target: { value: 'Oradea' } });
        fireEvent.change(screen.getByLabelText(/Județ:/i), { target: { value: 'Bihor' } });
        fireEvent.change(screen.getByLabelText(/Telefon:/i), { target: { value: '0700000000' } });
        fireEvent.click(screen.getByLabelText(/Masculin/i));

        fireEvent.click(screen.getByText('Salvează Datele'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/add-personal-data'),
                expect.objectContaining({ addressStreet: 'Nouă', phoneNumber: '0700000000' }),
                expect.any(Object)
            );
        });
    });
});
