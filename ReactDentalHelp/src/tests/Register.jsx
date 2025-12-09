import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Register from '../components/Register';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
const mock = new MockAdapter(axios);

// Mocks
jest.mock('axios');
jest.mock('../components/NavBar', () => () => <div>MockNavBar</div>);
jest.mock('../components/VerificationCodeNewAccount', () => () => <div>Verification Code</div>);

beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => 'mocked-token');
});

describe('Register', () => {

    it('renders the register form correctly', () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText('Nume')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Prenume')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('CNP')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Adresa e-mail')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Parola')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Repetă parola')).toBeInTheDocument();
        expect(screen.getByText('Crează Cont')).toBeInTheDocument();
    });

    it('displays error modal if email is invalid', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Adresa e-mail'), { target: { value: 'invalid-email' } });
        fireEvent.change(screen.getByPlaceholderText('Parola'), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByPlaceholderText('Repetă parola'), { target: { value: 'Password123' } });

        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(screen.getByText('E-mail invalid')).toBeInTheDocument();
            expect(screen.getByText('Adresa de e-mail este invalidă')).toBeInTheDocument();
        });
    });

    it('displays error modal if passwords do not match', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Adresa e-mail'), { target: { value: 'valid@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Parola'), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByPlaceholderText('Repetă parola'), { target: { value: 'DifferentPassword123' } });

        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(screen.getByText('Parolele nu coincid')).toBeInTheDocument();
            expect(screen.getByText('Parolele nu coincid')).toBeInTheDocument();
        });
    });

    it('displays success message after successful registration and opens verification dialog', async () => {
        axios.post.mockResolvedValueOnce({ status: 200, data: { message: 'Success' } });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Adresa e-mail'), { target: { value: 'valid@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Parola'), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByPlaceholderText('Repetă parola'), { target: { value: 'Password123' } });
        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(screen.getByText('Introduceți Codul de Verificare')).toBeInTheDocument();
        });
    });

    it('displays error modal when registration fails', async () => {
        axios.post.mockRejectedValueOnce({
            response: {
                data: { message: 'Email already exists in db' },
            },
        });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Adresa e-mail'), { target: { value: 'valid@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Parola'), { target: { value: 'Password123' } });
        fireEvent.change(screen.getByPlaceholderText('Repetă parola'), { target: { value: 'Password123' } });
        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(screen.getByText('Eroare')).toBeInTheDocument();
            expect(screen.getByText('Există deja un cont creat cu această adresă de e-mail!')).toBeInTheDocument();
        });
    });

    it('submits verification code and navigates to login page', async () => {
        axios.post.mockResolvedValueOnce({ status: 200, data: { message: 'Verified' } });

        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Cod de verificare'), { target: { value: '123456' } });
        fireEvent.click(screen.getByText('Trimite'));

        await waitFor(() => {
            expect(screen.getByText('Verification Code')).toBeInTheDocument();
        });
    });

    it('closes error modal on close button click', () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('Crează Cont'));

        expect(screen.getByText('E-mail invalid')).toBeInTheDocument();
        fireEvent.click(screen.getByText('E-mail invalid')); // Close modal
        expect(screen.queryByText('E-mail invalid')).not.toBeInTheDocument();
    });
});
