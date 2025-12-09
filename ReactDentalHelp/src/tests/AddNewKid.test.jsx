import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddNewKid from '../AddNewKid';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';
import * as authService from '../../service/authService'; // adapt path dacă e necesar

// Mocks
jest.mock('axios');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
}));
jest.spyOn(authService, 'parseJwt');

describe('AddNewKid component', () => {
    beforeEach(() => {
        // Pregătim valorile implicite
        localStorage.setItem('token', 'fakeToken123');
        authService.parseJwt.mockReturnValue({ cnp: '1234567890123' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders form fields correctly (unit test)', () => {
        render(<AddNewKid />, { wrapper: MemoryRouter });

        expect(screen.getByPlaceholderText('Nume')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Prenume')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('CNP')).toBeInTheDocument();
        expect(screen.getByText('Crează Cont')).toBeInTheDocument();
    });

    test('allows input values to be changed (unit test)', () => {
        render(<AddNewKid />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByPlaceholderText('Nume'), { target: { value: 'Ion' } });
        fireEvent.change(screen.getByPlaceholderText('Prenume'), { target: { value: 'Popescu' } });
        fireEvent.change(screen.getByPlaceholderText('CNP'), { target: { value: '1234567890123' } });

        expect(screen.getByDisplayValue('Ion')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Popescu')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1234567890123')).toBeInTheDocument();
    });

    test('submits form and calls axios with correct data (integration test)', async () => {
        axios.post.mockResolvedValue({ status: 200, data: { success: true } });

        render(<AddNewKid />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByPlaceholderText('Nume'), { target: { value: 'Ion' } });
        fireEvent.change(screen.getByPlaceholderText('Prenume'), { target: { value: 'Popescu' } });
        fireEvent.change(screen.getByPlaceholderText('CNP'), { target: { value: '1234567890123' } });

        fireEvent.click(screen.getByText('Crează Cont'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                'http://localhost:8080/api/auth/register/kid',
                {
                    firstName: 'Ion',
                    lastName: 'Popescu',
                    cnp: '1234567890123',
                    parent: '1234567890123',
                }
            );
        });
    });

    test('shows alert on server error (integration test)', async () => {
        window.alert = jest.fn();
        axios.post.mockRejectedValue({
            response: { data: { message: 'CNP deja folosit' } },
        });

        render(<AddNewKid />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByPlaceholderText('Nume'), { target: { value: 'Ion' } });
        fireEvent.change(screen.getByPlaceholderText('Prenume'), { target: { value: 'Popescu' } });
        fireEvent.change(screen.getByPlaceholderText('CNP'), { target: { value: '1234567890123' } });

        fireEvent.click(screen.getByText('Crează Cont'));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Eroare la înregistrare: CNP deja folosit');
        });
    });
});
