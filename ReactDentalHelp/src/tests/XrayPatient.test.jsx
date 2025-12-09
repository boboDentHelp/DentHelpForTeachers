import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import XrayPatient from './XrayPatient';
import axios from 'axios';
import '@testing-library/jest-dom';

// Mock the axios module
jest.mock('axios');

describe('XrayPatient Component', () => {

    const mockRadiographs = [
        {
            xrayId: 1,
            date: '2025-05-04',
            filePath: '/images/xray1.png',
            observations: 'No issues found',
        },
        {
            xrayId: 2,
            date: '2025-05-05',
            filePath: '/images/xray2.png',
            observations: 'Minor issues detected',
        },
    ];

    it('should render the component and display radiographs', async () => {
        // Mock the axios GET request to return a list of radiographs
        axios.get.mockResolvedValueOnce({
            data: { data: mockRadiographs },
            status: 200,
        });

        render(<XrayPatient cnp="12345" />);

        // Wait for the radiographs to load
        await waitFor(() => {
            // Check if radiographs are rendered
            expect(screen.getByText('Radiografiile tale')).toBeInTheDocument();
            expect(screen.getByText('Data: 2025-05-04')).toBeInTheDocument();
            expect(screen.getByText('Data: 2025-05-05')).toBeInTheDocument();
        });
    });

    it('should display "No radiographs available" when there are no radiographs', async () => {
        // Mock axios GET request to return no radiographs
        axios.get.mockResolvedValueOnce({
            data: { data: [] },
            status: 200,
        });

        render(<XrayPatient cnp="12345" />);

        // Wait for the message to load
        await waitFor(() => {
            expect(screen.getByText('Momentan nu aveți nici o radiografie.')).toBeInTheDocument();
        });
    });

    it('should display radiograph details when a radiograph is selected', async () => {
        // Mock axios GET request to return radiographs
        axios.get.mockResolvedValueOnce({
            data: { data: mockRadiographs },
            status: 200,
        });

        render(<XrayPatient cnp="12345" />);

        // Click on the first radiograph item to select it
        const radiographItem = screen.getByText('Data: 2025-05-04');
        fireEvent.click(radiographItem);

        // Check if the radiograph details are displayed
        expect(screen.getByText('Detalii Radiografie')).toBeInTheDocument();
        expect(screen.getByText('Data: 2025-05-04')).toBeInTheDocument();
        expect(screen.getByText('Observații: No issues found')).toBeInTheDocument();
    });

    it('should open the modal to view the image when the radiograph image is clicked', async () => {
        // Mock axios GET request to return radiographs
        axios.get.mockResolvedValueOnce({
            data: { data: mockRadiographs },
            status: 200,
        });

        render(<XrayPatient cnp="12345" />);

        // Click on the first radiograph item to select it
        const radiographItem = screen.getByText('Data: 2025-05-04');
        fireEvent.click(radiographItem);

        // Click the image to open the modal
        const image = screen.getByAltText('Radiografia din 2025-05-04');
        fireEvent.click(image);

        // Check if the modal is open with the selected image
        expect(screen.getByAltText('Radiografia din 2025-05-04')).toBeInTheDocument();
        expect(screen.getByText('×')).toBeInTheDocument(); // Close button in the modal
    });

    it('should close the modal when the close button is clicked', async () => {
        // Mock axios GET request to return radiographs
        axios.get.mockResolvedValueOnce({
            data: { data: mockRadiographs },
            status: 200,
        });

        render(<XrayPatient cnp="12345" />);

        // Click on the first radiograph item to select it
        const radiographItem = screen.getByText('Data: 2025-05-04');
        fireEvent.click(radiographItem);

        // Click the image to open the modal
        const image = screen.getByAltText('Radiografia din 2025-05-04');
        fireEvent.click(image);

        // Click the close button to close the modal
        const closeButton = screen.getByText('×');
        fireEvent.click(closeButton);

        // The modal should be closed, so the image should not be in the document
        expect(screen.queryByAltText('Radiografia din 2025-05-04')).not.toBeInTheDocument();
    });

});

