import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MainPageAdmin from '../components/MainPageAdmin';
import { BrowserRouter } from 'react-router-dom';

// Mock pentru useNavigate
const mockedUsedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
}));

// Mock Card și NavBar dacă sunt simple sau deja testate separat
jest.mock('../components/Card', () => ({ onClick, title }) => (
    <div onClick={onClick} data-testid={`card-${title}`}>
        {title}
    </div>
));
jest.mock('../components/NavBar', () => () => <div>MockNavBar</div>);

describe('MainPageAdmin', () => {
    beforeEach(() => {
        mockedUsedNavigate.mockClear();
    });

    it('afișează cardurile pentru programări și pacienți', () => {
        render(<MainPageAdmin />, { wrapper: BrowserRouter });

        expect(screen.getByTestId('card-Programari')).toBeInTheDocument();
        expect(screen.getByTestId('card-Pacienti')).toBeInTheDocument();
    });

    it('navighează către SchedulareAppointmentsPageAdmin la click pe cardul "Programari"', () => {
        render(<MainPageAdmin />, { wrapper: BrowserRouter });

        fireEvent.click(screen.getByTestId('card-Programari'));
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/SchedulareAppointmentsPageAdmin');
    });

    it('navighează către PatientsDoctor la click pe cardul "Pacienti"', () => {
        render(<MainPageAdmin />, { wrapper: BrowserRouter });

        fireEvent.click(screen.getByTestId('card-Pacienti'));
        expect(mockedUsedNavigate).toHaveBeenCalledWith('/PatientsDoctor');
    });
});
