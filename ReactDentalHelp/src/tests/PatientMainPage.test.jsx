import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientMainPage from '../components/PatientMainPage';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';

// Mock pentru useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock pentru NavBar
jest.mock('../components/NavBar', () => () => <div>NavBar</div>);

describe('PatientMainPage', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        render(
            <MemoryRouter>
                <PatientMainPage />
            </MemoryRouter>
        );
    });

    it('afișează toate cardurile', () => {
        expect(screen.getByText('Cere o programare')).toBeInTheDocument();
        expect(screen.getByText('Istoric și Date Personale')).toBeInTheDocument();
        expect(screen.getByText('Copii')).toBeInTheDocument();
    });

    it('navighează către /RequestAppointment când se apasă pe cardul corespunzător', () => {
        fireEvent.click(screen.getByText('Cere o programare'));
        expect(mockNavigate).toHaveBeenCalledWith('/RequestAppointment');
    });

    it('navighează către /PatientHistoryData când se apasă pe cardul Istoric și Date Personale', () => {
        fireEvent.click(screen.getByText('Istoric și Date Personale'));
        expect(mockNavigate).toHaveBeenCalledWith('/PatientHistoryData');
    });

    it('navighează către /KidsMainPage când se apasă pe cardul Copii', () => {
        fireEvent.click(screen.getByText('Copii'));
        expect(mockNavigate).toHaveBeenCalledWith('/KidsMainPage');
    });
});
