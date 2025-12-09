// eslint-disable-next-line no-unused-vars
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "../components/Login";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";


// Mock pentru navigator și axios
jest.mock("axios");
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => mockNavigate,
}));

jest.mock("../service/authService.jsx", () => ({
    parseJwt: () => ({ role: "PATIENT" }),
}));

describe("Login component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("afișează titlul și câmpurile de autentificare", () => {
        render(<Login />, { wrapper: MemoryRouter });

        expect(screen.getByText("BINE AȚI REVENIT")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("adresa e-mail")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("parola")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Conectează-te" })).toBeInTheDocument();
    });

    it("permite completarea emailului și parolei", () => {
        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByPlaceholderText("adresa e-mail"), {
            target: { value: "test@email.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("parola"), {
            target: { value: "test123" },
        });

        expect(screen.getByDisplayValue("test@email.com")).toBeInTheDocument();
        expect(screen.getByDisplayValue("test123")).toBeInTheDocument();
    });

    it("trimite formularul și navighează când loginul e reușit", async () => {
        axios.post.mockResolvedValueOnce({
            status: 200,
            data: { token: "mock.jwt.token" },
        });

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByPlaceholderText("adresa e-mail"), {
            target: { value: "user@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("parola"), {
            target: { value: "password" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Conectează-te" }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/Home");
        });
    });

    it("afișează modal de eroare pentru parolă greșită", async () => {
        axios.post.mockRejectedValueOnce({
            response: {
                data: { message: "Wrong password" },
            },
        });

        render(<Login />, { wrapper: MemoryRouter });

        fireEvent.change(screen.getByPlaceholderText("adresa e-mail"), {
            target: { value: "user@test.com" },
        });

        fireEvent.change(screen.getByPlaceholderText("parola"), {
            target: { value: "wrong" },
        });

        fireEvent.click(screen.getByRole("button", { name: "Conectează-te" }));

        const errorTitle = await screen.findByText("Parolă greșită");
        expect(errorTitle).toBeInTheDocument();
        expect(screen.getByText(/Parola pe care ați introdus-o este gresită/i)).toBeInTheDocument();
    });

    it("deschide fereastra de resetare a parolei", () => {
        render(<Login />, { wrapper: MemoryRouter });

        const forgotLink = screen.getByText(/Ati uitat parola\?/i);
        fireEvent.click(forgotLink);

        expect(screen.getByText("Resetează Parola")).toBeInTheDocument();
        expect(screen.getByLabelText("Adresa de e-mail")).toBeInTheDocument();
    });
});
