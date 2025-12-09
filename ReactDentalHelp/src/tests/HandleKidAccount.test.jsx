import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HandleKidAccount from '../HandleKidAccount';
import axios from 'axios';
import { parseJwt } from '../../service/authService.jsx';

jest.mock('axios');
jest.mock('../../service/authService.jsx', () => ({
    parseJwt: jest.fn(),
}));
jest.mock('../NavBar', () => () => <div>Mock NavBar</div>);
jest.mock('../RequestAppointmentKid', () => () => <div>Mock RequestAppointmentKid</div>);
jest.mock('../PatientsDoctorComponents/PatientPersonalData', () => () => <div>Mock PatientPersonalData</div>);

// helper render
const renderComponent = () => render(<HandleKidAccount />);

describe('HandleKidAccount', () => {
    const mockKid = { id: 1, firstName: 'Ion', lastName: 'Popescu', cnp: '1234567890123' };

    beforeEach(() => {
        jest.clearAllMocks();
        parseJwt.mockReturnValue({ cnp: '0001112223334' });
    });

    test('renders static texts and add button', () => {
        renderComponent();
        expect(screen.getByText(/Hai cu copilul la stomatolog/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Adăugă un copil/i })).toBeInTheDocument();
    });

    test('fetches and displays kids from API', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: [mockKid] } });

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Ion Popescu/i)).toBeInTheDocument();
        });
    });

    test('selecting a kid displays tabs and default tab content', async () => {
        axios.get.mockResolvedValueOnce({ data: { data: [mockKid] } });

        renderComponent();

        await waitFor(() => {
            fireEvent.click(screen.getByText(/Ion Popescu/i));
        });

        expect(screen.getByRole('button', { name: /Solicitați o programare/i })).toBeInTheDocument();
        expect(screen.getByText('Mock RequestAppointmentKid')).toBeInTheDocument();

        // Switch to "Date personale"
        fireEvent.click(screen.getByRole('button', { name: /Date personale/i }));
        expect(screen.getByText('Mock PatientPersonalData')).toBeInTheDocument();
    });

    test('opens add kid modal and fills in form', async () => {
        renderComponent();

        fireEvent.click(screen.getByText(/Adăugă un copil/i));

        const firstNameInput = screen.getByLabelText('Nume');
        const lastNameInput = screen.getByLabelText('Prenume');
        const cnpInput = screen.getByLabelText('CNP');

        fireEvent.change(firstNameInput, { target: { value: 'Maria' } });
        fireEvent.change(lastNameInput, { target: { value: 'Pop' } });
        fireEvent.change(cnpInput, { target: { value: '2345678901234' } });

        expect(firstNameInput.value).toBe('Maria');
        expect(lastNameInput.value).toBe('Pop');
        expect(cnpInput.value).toBe('2345678901234');
    });

    test('handles kid registration successfully', async () => {
        axios.post.mockResolvedValueOnce({ status: 200, data: {} });
        axios.get.mockResolvedValue({ data: { data: [mockKid] } });

        renderComponent();

        fireEvent.click(screen.getByText(/Adăugă un copil/i));

        fireEvent.change(screen.getByLabelText('Nume'), { target: { value: 'Maria' } });
        fireEvent.change(screen.getByLabelText('Prenume'), { target: { value: 'Pop' } });
        fireEvent.change(screen.getByLabelText('CNP'), { target: { value: '2345678901234' } });

        fireEvent.click(screen.getByText('Adaugă copilul'));

        await waitFor(() => {
            expect(screen.getByText('Întregistrare cu succes')).toBeInTheDocument();
        });
    });
});
