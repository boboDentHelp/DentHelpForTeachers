import { render, screen, fireEvent } from '@testing-library/react';
import VerificationCodeNewAccount from './VerificationCodeNewAccount';
import '@testing-library/jest-dom';

// Mock function for onSubmit and onClose
const mockOnSubmit = jest.fn();
const mockOnClose = jest.fn();

describe('VerificationCodeNewAccount Component', () => {

    it('should render the component when isOpen is true', () => {
        render(
            <VerificationCodeNewAccount
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        // Check if the input field and buttons are rendered
        expect(screen.getByPlaceholderText(/Cod de verificare/i)).toBeInTheDocument();
        expect(screen.getByText(/Trimite/i)).toBeInTheDocument();
        expect(screen.getByText(/Anulează/i)).toBeInTheDocument();
    });

    it('should not render the component when isOpen is false', () => {
        render(
            <VerificationCodeNewAccount
                isOpen={false}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        // The component should not render when isOpen is false
        expect(screen.queryByPlaceholderText(/Cod de verificare/i)).not.toBeInTheDocument();
    });

    it('should update the code state when input changes', () => {
        render(
            <VerificationCodeNewAccount
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const input = screen.getByPlaceholderText(/Cod de verificare/i);
        fireEvent.change(input, { target: { value: '123456' } });

        // Check if the input field value changes
        expect(input.value).toBe('123456');
    });

    it('should call onSubmit with the correct code when "Trimite" is clicked', () => {
        render(
            <VerificationCodeNewAccount
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const input = screen.getByPlaceholderText(/Cod de verificare/i);
        const submitButton = screen.getByText(/Trimite/i);

        // Simulate input change
        fireEvent.change(input, { target: { value: '123456' } });

        // Simulate submit button click
        fireEvent.click(submitButton);

        // Check if the onSubmit function was called with the correct argument
        expect(mockOnSubmit).toHaveBeenCalledWith('123456');
    });

    it('should call onClose when "Anulează" is clicked', () => {
        render(
            <VerificationCodeNewAccount
                isOpen={true}
                onClose={mockOnClose}
                onSubmit={mockOnSubmit}
            />
        );

        const cancelButton = screen.getByText(/Anulează/i);

        // Simulate cancel button click
        fireEvent.click(cancelButton);

        // Check if the onClose function was called
        expect(mockOnClose).toHaveBeenCalled();
    });

});

