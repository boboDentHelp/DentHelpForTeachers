import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Home from './Home';
import * as authService from '../service/authService';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useLocation: () => ({ hash: '' }),
}));

jest.mock('../components/NavBar.jsx', () => () => <div>Mock NavBar</div>);

describe('Home component', () => {
    const mockNavigate = jest.fn();
    const mockToken = (role) => {
        localStorage.setItem('token', 'fake-token');
        jest.spyOn(authService, 'isTokenValid').mockReturnValue(true);
        jest.spyOn(authService, 'parseJwt').mockReturnValue({ role });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('redirects unauthenticated user to /Login when clicking "Cere o programare"', () => {
        jest.spyOn(authService, 'isTokenValid').mockReturnValue(false);
        render(<Home />, { wrapper: MemoryRouter });

        const button = screen.getByText(/Cere o programare/i);
        fireEvent.click(button);
        expect(mockNavigate).toHaveBeenCalledWith('/Login');
    });

    it('navigates to /GeneralPatientBoard/request for PATIENT', () => {
        mockToken('PATIENT');
        render(<Home />, { wrapper: MemoryRouter });

        const button = screen.getByText(/Cere o programare/i);
        fireEvent.click(button);
        expect(mockNavigate).toHaveBeenCalledWith('/GeneralPatientBoard/request');
    });

    it('renders patient section if role is PATIENT', () => {
        mockToken('PATIENT');
        render(<Home />, { wrapper: MemoryRouter });

        expect(screen.getByText(/Opțiunile Tale/i)).toBeInTheDocument();
        expect(screen.getByText(/Istoric și Date Personale/i)).toBeInTheDocument();
    });

    it('renders admin section if role is ADMIN', () => {
        mockToken('ADMIN');
        render(<Home />, { wrapper: MemoryRouter });

        expect(screen.getByText(/Programări/i)).toBeInTheDocument();
        expect(screen.getByText(/Pacienți/i)).toBeInTheDocument();
    });

    it('renders radiologist section if role is RADIOLOGIST', () => {
        mockToken('RADIOLOGIST');
        render(<Home />, { wrapper: MemoryRouter });

        expect(screen.getByText(/Radiografii/i)).toBeInTheDocument();
    });

    it('shows alert if unauthenticated user tries to access personal data', () => {
        jest.spyOn(authService, 'isTokenValid').mockReturnValue(false);
        window.alert = jest.fn();

        render(<Home />, { wrapper: MemoryRouter });
        const personalDataButton = screen.getByText(/Istoric și Date Personale/i);

        fireEvent.click(personalDataButton);
        expect(window.alert).toHaveBeenCalledWith(
            'Pentru a putea acsesa aceasta sectiune trebuie sa fiti autentificat'
        );
    });
});
