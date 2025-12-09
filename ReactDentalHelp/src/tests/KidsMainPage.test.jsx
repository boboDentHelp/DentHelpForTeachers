import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import KidsMainPage from "../components/KidsMainPage";

// Mock pentru useNavigate
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

describe("KidsMainPage", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        useNavigate.mockReturnValue(mockNavigate);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("ar trebui să afișeze titlul și conținutul corect", () => {
        render(
            <MemoryRouter>
                <KidsMainPage />
            </MemoryRouter>
        );

        expect(
            screen.getByText("Înregistrați-vă copilul și gestionați totul dintr-un singur loc!")
        ).toBeInTheDocument();

        expect(
            screen.getByText(/gestionați programările și informațiile medicale/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Împreună, facem îngrijirea dentară mai ușoară/i)
        ).toBeInTheDocument();
    });

    it("ar trebui să afișeze imaginea copilului", () => {
        render(
            <MemoryRouter>
                <KidsMainPage />
            </MemoryRouter>
        );

        const image = screen.getByAltText("Kid");
        expect(image).toBeInTheDocument();
        expect(image.tagName).toBe("IMG");
    });

    it("navighează către /GeneralPatientBoard/register-kids când se apasă butonul", () => {
        render(
            <MemoryRouter>
                <KidsMainPage />
            </MemoryRouter>
        );

        const button = screen.getByRole("button", { name: /înregistrați-vă copilul/i });
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith("/GeneralPatientBoard/register-kids", {
            replace: true,
        });
    });
});
