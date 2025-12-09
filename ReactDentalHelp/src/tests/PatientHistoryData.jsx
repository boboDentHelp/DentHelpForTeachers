import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PatientHistoryData from '../components/PatientHistoryData';
import '@testing-library/jest-dom/extend-expect';

// Mockăm componentele care sunt randate dinamic
jest.mock('../components/PatientPersonalDataPage', () => () => <div>Componente Date Personale</div>);
jest.mock('../components/GeneralAnamnesis', () => () => <div>Componente Anamneza Generală</div>);
jest.mock('../components/PatientAppointmentsHistory', () => () => <div>Componente Programări</div>);
jest.mock('../components/XrayPatient', () => () => <div>Componente Radiografii</div>);
jest.mock('../components/GeneralPatientBoard', () => () => <div>GeneralPatientBoard</div>);
jest.mock('../components/NavBar', () => () => <div>NavBar</div>);

describe('PatientHistoryData', () => {
    beforeEach(() => {
        render(<PatientHistoryData />);
    });

    it('renderizează componenta implicită (Date Personale)', () => {
        expect(screen.getByText('Componente Date Personale')).toBeInTheDocument();
    });

    it('schimbă la componenta Anamneza Generală când se apasă butonul', () => {
        const button = screen.getByText('Anamneza Generală');
        fireEvent.click(button);
        expect(screen.getByText('Componente Anamneza Generală')).toBeInTheDocument();
    });

    it('schimbă la componenta Programările mele când se apasă butonul', () => {
        const button = screen.getByText('Programările mele');
        fireEvent.click(button);
        expect(screen.getByText('Componente Programări')).toBeInTheDocument();
    });

    it('schimbă la componenta Radiografii când se apasă butonul', () => {
        const button = screen.getByText('Radiografii');
        fireEvent.click(button);
        expect(screen.getByText('Componente Radiografii')).toBeInTheDocument();
    });

    it('setează clasa activă corect la apăsarea butonului', () => {
        const anamnezaBtn = screen.getByText('Anamneza Generală');
        fireEvent.click(anamnezaBtn);
        expect(anamnezaBtn.className).toMatch(/active-component-button/);
    });
});
