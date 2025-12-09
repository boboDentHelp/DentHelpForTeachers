import Register from "./components/Register.jsx";
import "./App.css"
import Login from "./components/Login.jsx";
import Home from "./components/Home.jsx";
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import PatientMainPage from "./components/PatientMainPage.jsx";
import GeneralAnamnesisPage from "./components/GeneralAnamnesisPage.jsx";
import PatientPersonalDataPage from "./components/PatientPersonalDataPage.jsx";
import RequestAppointment from "./components/RequestAppointment.jsx";
import PatientHistoryData from "./components/PatientHisotryData.jsx";
import MainPageAdmin from "./components/MainPageAdmin.jsx";
import PatientsDoctor from "./components/PatientsDoctor.jsx";
import AppointmentsDoctor from "./components/AppointmentsDoctor.jsx";
import Materials from "./components/Materials.jsx";
import SchedulareAppointmentsPageAdmin from "./components/SchedulareAppointmentsPageAdmin.jsx";
import PatientRoute from "./components/PatientRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import PatientPersonalData from "./components/PatientsDoctorComponents/PatientPersonalData.jsx";
import PatientStatus from "./components/PatientsDoctorComponents/PatientStatus.jsx";
import PatientRadiography from "./components/PatientsDoctorComponents/PatientRadiography.jsx";
import PatientGeneralAnamnesis from "./components/PatientsDoctorComponents/PatientGeneralAnamnesis.jsx";
import PatientAppointmentsForDoctor from "./components/PatientsDoctorComponents/PatientAppointmentsForDoctor.jsx";
import TreatmentSheetPatientView from "./components/TreatmentSheetPatientView.jsx";
import XrayPatient from "./components/XrayPatient.jsx";
import KidsMainPage from "./components/KidsMainPage.jsx";
import HandleKidAccount from "./components/HandleKidAccount.jsx";
import GeneralPatientBoard from "./components/GeneralPatientBoard.jsx";
import NotificationsAdmin from "./components/NotificationsAdmin.jsx";
import GeneralAdminBoard from "./components/GeneralAdminBoard.jsx";
import CabActivity from "./components/CabActivity.jsx";
import PatientAppointmentRequests from "./components/PatientAppointmentRequests.jsx";
import GeneralDentalStatus from "./components/GeneralDentalStatus.jsx";
import {useState} from "react";
import GeneralRadiologistBoard from "./components/GeneralRadiologistBoard.jsx";
import XrayPatientComponent from "./components/XrayPatientComponent.jsx";
import GeneralDentalStatusComponent from "./components/GeneralDentalStatusComponent.jsx";
import Consultant from "./components/Consultant.jsx";
import ChangeKidAccount from "./components/ChangeKidAccount.jsx";
import { Toaster } from "sonner";

function App(){
    return(
        <>
            <Toaster richColors position="top-right" />
            <Router>
                <div className="App">
                    <div style={{padding:0}} className="content">
                        <Routes>
                        <Route path='/' element={ <Home /> } />
                        <Route path='/Register' element={<Register></Register>}/>
                        <Route path='/Login' element={<Login></Login>}/>
                        <Route path='/Home' element={<Home></Home>}/>
                        <Route path='/PatientMainPage' element={<PatientRoute><PatientMainPage/></PatientRoute>}/>
                        <Route path='/GeneralAnamnesisPage' element={<PatientRoute><GeneralAnamnesisPage/></PatientRoute>}/>
                        <Route path='/PatientPersonalDataPage' element={<PatientPersonalDataPage/>}/>
                        <Route path='/RequestAppointment' element={<PatientRoute><RequestAppointment/></PatientRoute>}/>
                        <Route path='/PatientHistoryData' element={<PatientHistoryData></PatientHistoryData>}/>
                        <Route path='/MainPageAdmin' element={<AdminRoute><MainPageAdmin></MainPageAdmin></AdminRoute>}/>
                        <Route path='/PatientsDoctor' element={<AdminRoute><PatientsDoctor></PatientsDoctor></AdminRoute>}/>
                        <Route path='/AppointmentsDoctor' element={<AdminRoute><AppointmentsDoctor></AppointmentsDoctor></AdminRoute>}/>
                        <Route path='/Materials' element={<AdminRoute><Materials></Materials></AdminRoute>}/>
                        <Route path='/SchedulareAppointmentsPageAdmin' element={<AdminRoute><SchedulareAppointmentsPageAdmin></SchedulareAppointmentsPageAdmin></AdminRoute>}/>
                        <Route path='/PatientPaersonalDataA' element={<AdminRoute><PatientPersonalData></PatientPersonalData></AdminRoute>}/>
                        <Route path='/PatientStatusA' element={<AdminRoute><PatientStatus></PatientStatus></AdminRoute>}/>
                        <Route path='/PatientRadiographyA' element={<AdminRoute><PatientRadiography></PatientRadiography></AdminRoute>}/>
                        <Route path='/PatientGeneralAnamnesisA' element={<AdminRoute><PatientGeneralAnamnesis></PatientGeneralAnamnesis></AdminRoute>}/>
                        <Route path='/PatientAppointmentsA' element={<AdminRoute><PatientAppointmentsForDoctor></PatientAppointmentsForDoctor></AdminRoute>}/>
                        <Route path='/Consultant' element={<AdminRoute><Consultant></Consultant></AdminRoute>}/>
                        <Route path='/TreatmentSheetPatientView' element={<PatientRoute><TreatmentSheetPatientView></TreatmentSheetPatientView></PatientRoute>}/>
                        <Route path='/XRaysPatient' element={<PatientRoute><XrayPatientComponent></XrayPatientComponent></PatientRoute>}/>
                        <Route path='/KidsMainPage' element={<PatientRoute><KidsMainPage></KidsMainPage></PatientRoute>}/>
                        <Route path='/HandleKidAccount' element={<PatientRoute><HandleKidAccount></HandleKidAccount></PatientRoute>}></Route>
                        <Route path='/GeneralPatientBoard/:component' element={<PatientRoute><GeneralPatientBoard></GeneralPatientBoard></PatientRoute>}></Route>
                        <Route path='/NotificationsAdmin' element={<AdminRoute><NotificationsAdmin></NotificationsAdmin></AdminRoute>}></Route>
                        <Route path='/GeneralAdminBoard/:component' element={<AdminRoute><GeneralAdminBoard></GeneralAdminBoard></AdminRoute>}></Route>
                        <Route path='/CabActivity' element={<CabActivity></CabActivity>}/>
                        <Route path='/GeneralDentalStatus' element={<PatientRoute><GeneralDentalStatusComponent/></PatientRoute>}/>
                        <Route path='/ChangeKidAccount' element={<PatientRoute><ChangeKidAccount/></PatientRoute>}/>
                        <Route path='/GeneralRadiologistBoard/:component' element={<PatientRoute><GeneralRadiologistBoard></GeneralRadiologistBoard></PatientRoute>}/>
                        </Routes>
                    </div>
                </div>
            </Router>
        </>
    )
}

export default App;