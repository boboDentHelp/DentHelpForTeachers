import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeneralRadiologistBoard from '../GeneralRadiologistBoard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import axios from 'axios';

// Mock-uri
jest.mock('axios');
jest.mock('../PatientsForRadiologist', () => () => <div>Mock PatientsForRadiologist</div>);
jest.mock('../NavBar', () => () => <div>Mock NavBar</div>);

// Wrapper cu router pentru a simula parametrii din URL
const renderWithRouter = (initialPath = '/GeneralRadiologistBoard/patientsXrays') => {
    return render(
        <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
                <Route path="/GeneralRadiologistBoard/:component" element={<GeneralRadiologistBoard />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('GeneralRadiologistBoard component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders logo and navigation items', () => {
        renderWithRouter('/GeneralRadiologistBoard/patientsXrays');

        expect(screen.getByAltText('DENTHELP')).toBeInTheDocument();
        expect(screen.getByText(/DENT\s*HELP/i)).toBeInTheDocument();
        expect(screen.getByText('Pacienți')).toBeInTheDocument();
        expect(screen.getByText('Contact')).toBeInTheDocument();
        expect(screen.getByText('Despre noi')).toBeInTheDocument();
    });

    test('renders PatientsForRadiologist component when clicking Pacienți (integration)', async () => {
        renderWithRouter('/GeneralRadiologistBoard/patientsXrays');

        await waitFor(() => {
            expect(screen.getByText('Mock PatientsForRadiologist')).toBeInTheDocument();
        });
    });

    test('fetches patient data on mount (mocked API)', async () => {
        const mockPatients = [
            { firstName: 'Ana', lastName: 'Pop', cnp: '123' },
            { firstName: 'Mihai', lastName: 'Ionescu', cnp: '456' }
        ];

        axios.get.mockResolvedValueOnce({ data: { data: mockPatients } });

        renderWithRouter();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith('http://localhost:8080/api/admin/patient/get-patients', expect.any(Object));
        });
    });

    test('clicking Contact or Despre noi calls navigate (unit)', () => {
        const mockedNavigate = jest.fn();
        jest.mock('react-router-dom', () => ({
            ...jest.requireActual('react-router-dom'),
            useNavigate: () => mockedNavigate,
        }));

        renderWithRouter();

        fireEvent.click(screen.getByText('Contact'));
        fireEvent.click(screen.getByText('Despre noi'));

    });
});
