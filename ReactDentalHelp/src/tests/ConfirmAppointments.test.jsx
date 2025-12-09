import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ConfirmAppointments from "../ConfirmAppointments";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import MockAdapter from "axios-mock-adapter";

// Setup mock Axios
const mock = new MockAdapter(axios);

const mockAppointments = [
    {
        appointmentReason: "Control de rutină",
        desiredAppointmentTime: "2025-05-01 10:00",
        appointmentRequestId: 1,
        patientCnp: "1234567890123"
    }
];

const mockPatient = {
    data: {
        data: {
            firstName: "Ion",
            lastName: "Popescu"
        }
    }
};

describe("ConfirmAppointments", () => {
    beforeEach(() => {
        localStorage.setItem("token", "test-token");
        mock.reset();
    });

    it("ar trebui să afișeze mesajul 'Nu există solicitări pentru programări.' dacă nu sunt date", async () => {
        mock.onGet(/get-appointments-request/).reply(200, { data: [] });

        render(<ConfirmAppointments />, { wrapper: MemoryRouter });

        expect(await screen.findByText("Nu există solicitări pentru programări.")).toBeInTheDocument();
    });

    it("ar trebui să afișeze solicitările dacă sunt returnate din API", async () => {
        mock.onGet(/get-appointments-request/).reply(200, { data: mockAppointments });
        mock.onGet(/get-patient-personal-data/).reply(200, mockPatient);

        render(<ConfirmAppointments />, { wrapper: MemoryRouter });

        expect(await screen.findByText("Solicitări Programări")).toBeInTheDocument();
        expect(await screen.findByText("Control de rutină")).toBeInTheDocument();
        expect(await screen.findByText("Ion Popescu")).toBeInTheDocument();
    });

    it("ar trebui să afișeze eroare dacă datele de confirmare sunt incomplete", async () => {
        mock.onGet(/get-appointments-request/).reply(200, { data: mockAppointments });
        mock.onGet(/get-patient-personal-data/).reply(200, mockPatient);

        render(<ConfirmAppointments />, { wrapper: MemoryRouter });

        // Deschide meniul secundar
        fireEvent.click(await screen.findByAltText("Mai mult"));

        // Apasă pe butonul de confirmare fără a completa datele
        fireEvent.click(await screen.findByText("Trimite Confirmarea"));

        await waitFor(() => {
            expect(screen.getByText("Completati fiecare camp!")).toBeInTheDocument();
        });
    });

    it("ar trebui să trimită cererea de respingere", async () => {
        mock.onGet(/get-appointments-request/).reply(200, { data: mockAppointments });
        mock.onGet(/get-patient-personal-data/).reply(200, mockPatient);
        mock.onPost(/rejectAppointment/).reply(200);

        render(<ConfirmAppointments />, { wrapper: MemoryRouter });

        fireEvent.click(await screen.findByAltText("Mai mult"));
        fireEvent.click(await screen.findByText("Respinge Solicitarea"));

        const input = await screen.findByPlaceholderText("Precizează intervale disponibile pentru pacient");
        fireEvent.change(input, { target: { value: "Suntem disponibili săptămâna viitoare" } });

        fireEvent.click(screen.getByText("Da, respinge solicitare!"));

        await waitFor(() => {
            expect(mock.history.post.length).toBe(1);
        });
    });
});
