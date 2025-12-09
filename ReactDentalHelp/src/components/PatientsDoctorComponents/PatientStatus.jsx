import {useEffect, useState} from 'react';
import generalTooth from "../../assets/tooth/general_tooth.png";
import style from "../../assets/css/Teeht.module.css"
import t11 from "../../assets/tooth/11.png";
import t11P from "../../assets/tooth/11P.png";
import t11G from "../../assets/tooth/11G.png";
import t12 from "../../assets/tooth/12.png";
import t12G from "../../assets/tooth/12G.png";
import t12P from "../../assets/tooth/12P.png";
import t13 from "../../assets/tooth/13.png";
import t13P from "../../assets/tooth/13P.png";
import t13G from "../../assets/tooth/13G.png";
import t14 from "../../assets/tooth/14.png";
import t14P from "../../assets/tooth/14P.png";
import t14G from "../../assets/tooth/14G.png";
import t15 from "../../assets/tooth/15.png";
import t15P from "../../assets/tooth/15P.png";
import t15G from "../../assets/tooth/15G.png";
import t16 from "../../assets/tooth/16.png";
import t16P from "../../assets/tooth/16P.png";
import t16G from "../../assets/tooth/16G.png";
import t17 from "../../assets/tooth/17.png";
import t17P from "../../assets/tooth/17P.png";
import t17G from "../../assets/tooth/17G.png";
import t18 from "../../assets/tooth/18.png";
import t18P from "../../assets/tooth/18P.png";
import t18G from "../../assets/tooth/18G.png";
import t21 from "../../assets/tooth/21.png";
import t21P from "../../assets/tooth/21P.png";
import t21G from "../../assets/tooth/21G.png";
import t22P from "../../assets/tooth/22P.png";
import t22G from "../../assets/tooth/22G.png";
import t22 from "../../assets/tooth/22.png";
import t23 from "../../assets/tooth/23.png";
import t23G from "../../assets/tooth/23G.png";
import t23P from "../../assets/tooth/23P.png";
import t24 from "../../assets/tooth/24.png";
import t24P from "../../assets/tooth/24P.png";
import t24G from "../../assets/tooth/24G.png";
import t25 from "../../assets/tooth/25.png";
import t25P from "../../assets/tooth/25P.png";
import t25G from "../../assets/tooth/25G.png";
import t26 from "../../assets/tooth/26.png";
import t26G from "../../assets/tooth/26G.png";
import t26P from "../../assets/tooth/26P.png";
import t27 from "../../assets/tooth/27.png";
import t27P from "../../assets/tooth/27P.png";
import t27G from "../../assets/tooth/27G.png";
import t28 from "../../assets/tooth/28.png";
import t28P from "../../assets/tooth/28P.png";
import t28G from "../../assets/tooth/28G.png";

import t31 from "../../assets/tooth/31.png";
import t31P from "../../assets/tooth/31P.png";
import t31G from "../../assets/tooth/31G.png";
import t32 from "../../assets/tooth/32.png";
import t32G from "../../assets/tooth/32G.png";
import t32P from "../../assets/tooth/32P.png";
import t33 from "../../assets/tooth/33.png";
import t33G from "../../assets/tooth/33G.png";
import t33P from "../../assets/tooth/33P.png";
import t34 from "../../assets/tooth/34.png";
import t34P from "../../assets/tooth/34P.png";
import t34G from "../../assets/tooth/34G.png";
import t35 from "../../assets/tooth/35.png";
import t35P from "../../assets/tooth/35P.png";
import t35G from "../../assets/tooth/35G.png";
import t36 from "../../assets/tooth/36.png";
import t36P from "../../assets/tooth/36P.png";
import t36G from "../../assets/tooth/36G.png";
import t37 from "../../assets/tooth/37.png";
import t37P from "../../assets/tooth/37P.png";
import t37G from "../../assets/tooth/37G.png";
import t38 from "../../assets/tooth/38.png";
import t38P from "../../assets/tooth/38P.png";
import t38G from "../../assets/tooth/38G.png";
import t41 from "../../assets/tooth/41.png";
import t41P from "../../assets/tooth/41P.png";
import t41G from "../../assets/tooth/41G.png";
import t42 from "../../assets/tooth/42.png";
import t42P from "../../assets/tooth/42P.png";
import t42G from "../../assets/tooth/42g.png";
import t43 from "../../assets/tooth/43.png";
import t43P from "../../assets/tooth/43P.png";
import t43G from "../../assets/tooth/43G.png";
import t44 from "../../assets/tooth/44.png";
import t44P from "../../assets/tooth/44P.png";
import t44G from "../../assets/tooth/44G.png";
import t45 from "../../assets/tooth/45.png";
import t45G from "../../assets/tooth/45G.png";
import t45P from "../../assets/tooth/45P.png";
import t46 from "../../assets/tooth/46.png";
import t46G from "../../assets/tooth/46G.png";
import t46P from "../../assets/tooth/46P.png";
import t47 from "../../assets/tooth/47.png";
import t47P from "../../assets/tooth/47P.png";
import t47G from "../../assets/tooth/47G.png";
import t48 from "../../assets/tooth/48.png";
import t48G from "../../assets/tooth/48G.png";
import t48P from "../../assets/tooth/48P.png";
import axios from "axios";
import styles from "../../assets/css/PatientRadiography.module.css";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import InfoBox from "../InfoBox.jsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, TrashIcon, Pencil2Icon } from "@radix-ui/react-icons";

function PatientStatus(props) {
    const [selectedTeeth, setSelectedTeeth] = useState(null);
    const [teethHistory, setTeethHistory] = useState([]);
    const [teethProblems, setTeethPtoblems] = useState([]);
    const [selectedIntervention, setSelectedIntervention] = useState(null);
    const [selectedProblem, setSelectedProblem] = useState(null);
    const [showAddNewIntervention, setShowAddNewIntervention] = useState(null);
    const [showAddNewProblem, setShowAddNewProblem] = useState(null);
    const [newInterventionDetails, setNewInterventionDetails] = useState(null);
    const [newProblemDetails, setNewProblemDetails] = useState(null);
    const [editingIntervention, setEditingIntervention] = useState(false);
    const [editingProblem, setEditingProblem] = useState(false);
    const [editDetails, setEditDetails] = useState("");
    const [editProblems, setEditProblems] = useState("");
    const [isToggled, setIsToggle] = useState(false);
    const [allExtractedTeeth, setAllExtractedTeeth] = useState([]);
    const [allToothProblems, setAllToothProblems]= useState([]);
    const [chooseIsExtractedSelectedTeeth, setChooseIsExtractedSelectedTeeth] = useState(false);
    const [infoAddNewProblemBoxVisible, setAddProblemInfoBoxVisible] = useState(false);
    const [infoAddNewInerventionBoxVisible, setAddInterventionInfoBoxVisible] = useState(false);
    const [infoEditProblemBoxVisible, setEditProblemInfoBoxVisible] = useState(false);
    const [infoEditInterventionBoxVisible, setEditInterventionInfoBoxVisible] = useState(false);
    const [showConfirmDeleteProblem, setShowConfirmDeleteProblem] = useState(false);
    const [showConfirmDeleteIntervention, setShowConfirmDeleteIntervention] =useState(false);
    const [showDeleteIntervention, setShowDeleteIntervention] =useState(false);
    const [showDeleteProblem, setShowDeleteProblem] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage]= useState("");
    const baseUrl = import.meta.env.VITE_BACKEND_URL;


    const closeErrorMessage = () =>{
        setShowError(false);
    }

    const fetchPatientStatus = () =>{
    }

    const closeConfirmationDeleteProblem =()=>{
        setShowConfirmDeleteProblem(false);
    }

    const closeConfirmationDeleteIntervention=()=>{
        setShowConfirmDeleteIntervention(false);
    }

    const openConfirmDeleteProblem=()=>{
        setShowConfirmDeleteProblem(true);
    }

    const openConfirmDeleteIntervention=()=>{
        setShowConfirmDeleteIntervention(true);
    }

    const closeDeleteProblem =()=>{
        setShowDeleteProblem(false);
    }

    const closeDeleteIntervention=()=>{
        setShowDeleteIntervention(false);
    }

    const openDeleteProblem=()=>{
        setShowDeleteProblem(true);
    }

    const openDeleteIntervention=()=>{
        setShowDeleteIntervention(true);
    }

    const closeInfoAddProblemBox = () => {
        setAddProblemInfoBoxVisible(false);
    };

    const closeInfoAddInterventionBox = () => {
        setAddInterventionInfoBoxVisible(false);
    };

    const closeInfoEditProblemBox = () => {
        setEditProblemInfoBoxVisible(false);
    };

    const closeInfoEditInterventionBox = () => {
        setEditInterventionInfoBoxVisible(false);
    };

    const getAllExtractedTeeth =async (e) =>{
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                baseUrl+`/api/in/teeth/get_patient_all_extracted_tooth/${props.cnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                console.log("extractii")
                console.log(response.data.data)
                const teeth_numbers = response.data.data.map((teeth) =>teeth.toothNumber)
                const unique =[...new Set(teeth_numbers)]
                setAllExtractedTeeth(unique)
            } else {
                console.error('Eroare la preluarea extractiilor');
            }
        } catch (error) {
            console.error(`Eroare la preluarea extractiilor`, error);
        }
    };
    const getAllToothProblems = async (e) =>{
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                baseUrl+`/api/in/teeth/problems/get_patient_all_tooth_problems/${props.cnp}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                console.log("problem")
                console.log(response.data.data)
                const teeth_numbers = response.data.data.map((teeth) =>teeth.toothNumber)
                const unique =[...new Set(teeth_numbers)]
                setAllToothProblems(unique);
            } else {
                console.error('Eroare la preluarea interventiilor dintelui');
            }
        } catch (error) {
            console.error(`Eroare la preluarea intervențiilor asupra dintelui ${teethId}`, error);
        }
    };

    const getTeethProblems = async (teethId) =>{
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                baseUrl+`/api/in/teeth/problems/get_patient_tooth_problems/${props.cnp}/${teethId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                console.log(response.data.data)
                setTeethPtoblems(response.data.data)
            } else {
                console.error('Eroare la preluarea interventiilor dintelui');
            }
        } catch (error) {
            console.error(`Eroare la preluarea intervențiilor asupra dintelui ${teethId}`, error);
        }
    };

    const getTeethHistory = async (teethId) =>{
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                baseUrl+`/api/in/teeth/get_patient_tooth_history/${props.cnp}/${teethId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.status === 200) {
                setTeethHistory(response.data.data)
            } else {
                console.error('Eroare la preluarea interventiilor dintelui');
            }
        } catch (error) {
            console.error(`Eroare la preluarea intervențiilor asupra dintelui ${teethId}`, error);
        }
    };

    const handleDeleteExtraction = async (toothNumber) =>{
        try{
            console.log(toothNumber)
            const token = localStorage.getItem('token');
            const response = await axios.delete(baseUrl+`/api/in/teeth/deleteExtraction/${props.cnp}/${toothNumber}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setNewInterventionDetails(null);
                getTeethHistory(selectedTeeth);
                getAllExtractedTeeth();
            }
        } catch (error) {
            setErrorMessage('Eroare la stergerea extractiei.');
            setShowError(true);
        }
    }

    const handleSubmit = async (isExtracted,e) =>{
        e.preventDefault()
        console.log(isExtracted)
            try {
                const response = await axios.post(baseUrl+'/api/in/teeth/addNewIntervention', {
                    interventionDetails: newInterventionDetails,
                    toothNumber: selectedTeeth,
                    patientCnp: props.cnp,
                    dateIntervention:new Date().toISOString().split('T')[0],
                        isExtracted: isExtracted,
                },{headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },}

                );
                if (response.status === 200) {
                    setShowAddNewIntervention(false);
                    setNewInterventionDetails(null);
                    setAddInterventionInfoBoxVisible(true);
                    getTeethHistory(selectedTeeth);
                    getAllExtractedTeeth();

                }
            } catch (error) {
                setErrorMessage('Eroare la adaugarea interventiei.');
                setShowError(true);
            }
    };
    const handleAddNewProblem = async (e) =>{
        e.preventDefault();
        try {
            const response = await axios.post(baseUrl+'/api/in/teeth/problems/addNewProblem', {
                    problemDetails: newProblemDetails,
                    toothNumber: selectedTeeth,
                    patientCnp: props.cnp,
                    dateProblem:new Date().toISOString().split('T')[0]
                },{headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },}

            );
            if (response.status === 200) {
                setShowAddNewProblem(false);
                setNewProblemDetails(null);
                setAddProblemInfoBoxVisible(true);
                getAllToothProblems()
                getTeethProblems(selectedTeeth)
            }
        } catch (error) {
            setErrorMessage('Eroare la adaugarea unei probleme.');
            setShowError(true);
        }
    };
    const handleDeleteIntervention = async (intervention) =>{
        closeConfirmationDeleteIntervention();
        try{
            const token = localStorage.getItem('token');
            const response = await axios.delete(baseUrl+`/api/in/teeth/deleteIntervention/${intervention.interventionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                setSelectedIntervention(null);
                openDeleteIntervention();
                setNewInterventionDetails(null);
                getTeethHistory(selectedTeeth)
            }
        } catch (error) {
            setErrorMessage('Eroare la stergerea interventiei.');
            setShowError(true);
        }
    }
    const handleDeleteProblem = async (problem) =>{
        closeConfirmationDeleteProblem()
        try{
            const token = localStorage.getItem('token');
            const response = await axios.delete(baseUrl+`/api/in/teeth/problems/deleteProblem/${problem.problemId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status === 200) {
                openDeleteProblem();
                setNewProblemDetails(null);
                setSelectedProblem(null);
                getAllToothProblems()
                getTeethProblems(selectedTeeth)
            }
        } catch (error) {
            setErrorMessage('Eroare la adaugarea interventiei.');
            setShowError(true);
        }
    }
    const handleEditIntervention =  async (e) =>{
        e.preventDefault();
        try{
            const token = localStorage.getItem('token');
            console.log(editDetails)
            const response = await axios.put(
                baseUrl+`/api/in/teeth/editIntervention`,
                {
                    interventionDetails: editDetails,
                    interventionId:selectedIntervention.interventionId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setSelectedTeeth(selectedTeeth);
                setEditDetails("");
                setEditingIntervention(false);
                getTeethHistory(selectedTeeth)
                setEditInterventionInfoBoxVisible(true);
            }
        }catch(error){
            setErrorMessage('Eroare la editarea interventiei');
            setShowError(true);
        }
    }
    const handleEditProblem =  async (e) =>{
        e.preventDefault();
        try{
            const token = localStorage.getItem('token');
            console.log(editProblems)
            const response = await axios.put(
                baseUrl+`/api/in/teeth/problems/editProblem`,
                {
                    problemDetails: editProblems,
                    problemId: selectedProblem.problemId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                getTeethProblems(selectedTeeth)
                setSelectedProblem(null);
                setEditProblems("");
                setEditingProblem(false);
                setEditProblemInfoBoxVisible(true);
            }
        }catch(error){
            setErrorMessage('Eroare la editarea problemei');
            setShowError(true);
        }
    }

    const startEditIntervention = (intervention) => {
        setEditingIntervention(true);
        setEditDetails(intervention.interventionDetails); // Populăm cu datele existente
    };
    const startEditProblem = (problem) => {
        setEditingProblem(true);
        setEditProblems(problem.interventionDetails); // Populăm cu datele existente
    }

    const cancelEditIntervention = () => {
        setEditingIntervention(false);
        setEditDetails("");
    };
    const cancelEditProblem = () => {
        setEditingProblem(false);
        setEditProblems("");
    };
    const handleInterventionClick = (intervention) =>{
        if(selectedIntervention===intervention)
            setSelectedIntervention(null);
        else{
        setSelectedIntervention(intervention);
        }
    }
    const handleProblemClick = (problem) =>{
        if(selectedProblem === problem)
            setSelectedProblem(null);
        else{
        setSelectedProblem(problem);
        }
    }
    const handleShowNewIntervention = () =>{
        setShowAddNewIntervention(true);
    }
    const handleShowNewProblem = () =>{
        setShowAddNewProblem(true);
    }
    const cancelShowNewIntervention = () =>{
        setShowAddNewIntervention(false);
    }
    const cancelShowNewProblem = () =>{
        setShowAddNewProblem(false);
    }

    const handleToggle = ()=>{
        setIsToggle((prevState) => !prevState)
        setSelectedTeeth(null)
        setSelectedProblem(null)
        setSelectedIntervention(null)
    }

    const isTeethExtracted =(teethId)=>{
        getAllExtractedTeeth();
        const isExtracted = allExtractedTeeth.some((toothNumber)=> toothNumber===teethId);
        console.log(isExtracted)
        if(isExtracted){
            setChooseIsExtractedSelectedTeeth(true);}
        else{
            setChooseIsExtractedSelectedTeeth(false);
        }
    }

    const handleTeethClick =  (teethId) => {
        setSelectedTeeth(teethId);
        getTeethHistory(teethId);
        getTeethProblems(teethId)
        setShowAddNewIntervention(false);
        setSelectedIntervention(null);
        setShowAddNewProblem(false);
        setSelectedProblem(null);
        isTeethExtracted(teethId);
    }

    const handleChooseIsExtracting = (e)=>{
        if(chooseIsExtractedSelectedTeeth){
            handleDeleteExtraction(selectedTeeth);
        }
        else{
            handleSubmit("true",e);
            getTeethHistory();
            getAllExtractedTeeth();
        }
        setChooseIsExtractedSelectedTeeth((prevState) => !prevState)

    }

    useEffect(() => {
        if (props.cnp) {
            fetchPatientStatus();
            getAllExtractedTeeth();
            getAllToothProblems();
            setSelectedIntervention(null);
            setSelectedProblem(null);
            setTeethHistory([]);
            setSelectedTeeth(null);
        }
    }, [props.cnp]);


    return (

        <div className={style.page}>
            {infoAddNewProblemBoxVisible && <InfoBox message={"Problema a fost adaugată cu succes."} onClose={closeInfoAddProblemBox}/>}
            {infoAddNewInerventionBoxVisible && <InfoBox message={"Intervenția a fost adaugată cu succes."} onClose={closeInfoAddInterventionBox}/>}
            {infoEditInterventionBoxVisible && <InfoBox message={"Intervenția a fost editată cu succes."} onClose={closeInfoEditInterventionBox}/>}
            {infoEditProblemBoxVisible && <InfoBox message={"Problema a fost editată cu succes."} onClose={closeInfoEditProblemBox}/>}

            {!isToggled ?(
            <div className={style["status"]}>
                <div className={style["upperPart"]}>
                    <div className={style["firstUpperPart"]}>
                        <img onClick={() => handleTeethClick(18)} className={style["t18"]}
                             src={allToothProblems.includes(18) ? t18P : allExtractedTeeth.includes(18) ? t18G : t18} alt="kid"/>
                        <img onClick={() => handleTeethClick(17)} className={style["t17"]}
                             src={allToothProblems.includes(17) ? t17P : allExtractedTeeth.includes(17) ? t17G :t17} alt="kid"/>
                        <img onClick={() => handleTeethClick(16)} className={style["t16"]}
                             src={allToothProblems.includes(16) ? t16P : allExtractedTeeth.includes(16) ? t16G :t16} alt="kid"/>
                        <img onClick={() => handleTeethClick(15)} className={style["t15"]}
                             src={allToothProblems.includes(15) ? t15P : allExtractedTeeth.includes(15) ? t15G :t15} alt="kid"/>
                        <img onClick={() => handleTeethClick(14)} className={style["t14"]}
                             src={allToothProblems.includes(14) ? t14P : allExtractedTeeth.includes(14) ? t14G :t14} alt="kid"/>
                        <img onClick={() => handleTeethClick(13)} className={style["t13"]}
                             src={allToothProblems.includes(13) ? t13P : allExtractedTeeth.includes(13) ? t13G :t13} alt="kid"/>
                    </div>
                    <div className={style["upperMiddlePart"]}>
                        <img onClick={() => handleTeethClick(12)} className={style["t12"]}
                             src={allToothProblems.includes(12) ? t12P : allExtractedTeeth.includes(12) ? t12G :t12} alt="kid"/>
                        <img onClick={() => handleTeethClick(11)} className={style["t11"]}
                             src={allToothProblems.includes(11) ? t11P : allExtractedTeeth.includes(11) ? t11G :t11} alt="kid"/>
                        <img onClick={() => handleTeethClick(21)} className={style["t21"]}
                             src={allToothProblems.includes(21) ? t21P : allExtractedTeeth.includes(21) ? t21G :t21} alt="kid"/>
                        <img onClick={() => handleTeethClick(22)} className={style["t22"]}
                             src={allToothProblems.includes(22) ? t22P : allExtractedTeeth.includes(22) ? t22G :t22} alt="kid"/>
                    </div>
                    <div className={style["lastUpperPart"]}>
                        <img onClick={() => handleTeethClick(23)} className={style["t23"]}
                             src={allToothProblems.includes(23) ? t23P : allExtractedTeeth.includes(23) ? t23G :t23} alt="kid"/>
                        <img onClick={() => handleTeethClick(24)} className={style["t24"]}
                             src={allToothProblems.includes(24) ? t24P : allExtractedTeeth.includes(24) ? t24G :t24} alt="kid"/>
                        <img onClick={() => handleTeethClick(25)} className={style["t25"]}
                             src={allToothProblems.includes(25) ? t25P : allExtractedTeeth.includes(25) ? t25G :t25} alt="kid"/>
                        <img onClick={() => handleTeethClick(26)} className={style["t26"]}
                             src={allToothProblems.includes(26) ? t26P : allExtractedTeeth.includes(26) ? t26G :t26} alt="kid"/>
                        <img onClick={() => handleTeethClick(27)} className={style["t27"]}
                             src={allToothProblems.includes(27) ? t27P : allExtractedTeeth.includes(27) ? t27G :t27} alt="kid"/>
                        <img onClick={() => handleTeethClick(28)} className={style["t28"]}
                             src={allToothProblems.includes(28) ? t28P : allExtractedTeeth.includes(28) ? t28G :t28} alt="kid"/>
                    </div>
                </div>
                <div className={style["oblique-line"]}></div>
                <div className={style["downPart"]}>
                    <div className={style["firstDownPart"]}>
                        <img onClick={() => handleTeethClick(48)} className={style["t38"]}
                             src={allToothProblems.includes(48) ? t48P : allExtractedTeeth.includes(48) ? t48G :t48} alt="kid"/>
                        <img onClick={() => handleTeethClick(47)} className={style["t37"]}
                             src={allToothProblems.includes(47) ? t47P : allExtractedTeeth.includes(47) ? t47G :t47} alt="kid"/>
                        <img onClick={() => handleTeethClick(46)} className={style["t36"]}
                             src={allToothProblems.includes(46) ? t46P : allExtractedTeeth.includes(46) ? t46G :t46} alt="kid"/>
                        <img onClick={() => handleTeethClick(45)} className={style["t35"]}
                             src={allToothProblems.includes(45) ? t46P : allExtractedTeeth.includes(45) ? t45G :t45} alt="kid"/>
                        <img onClick={() => handleTeethClick(44)} className={style["t34"]}
                             src={allToothProblems.includes(44) ? t44P : allExtractedTeeth.includes(44) ? t44G :t44} alt="kid"/>
                        <img onClick={() => handleTeethClick(43)} className={style["t33"]}
                             src={allToothProblems.includes(43) ? t43P : allExtractedTeeth.includes(43) ? t43G :t43} alt="kid"/>
                    </div>

                    <div className={style["middleDownPart"]}>
                        <img onClick={() => handleTeethClick(42)} className={style["t32"]}
                             src={allToothProblems.includes(42) ? t42P : allExtractedTeeth.includes(42) ? t42G :t42} alt="kid"/>
                        <img onClick={() => handleTeethClick(41)} className={style["t31"]}
                             src={allToothProblems.includes(41) ? t41P : allExtractedTeeth.includes(41) ? t41G :t41} alt="kid"/>
                        <img onClick={() => handleTeethClick(31)} className={style["t41"]}
                             src={allToothProblems.includes(43) ? t31P : allExtractedTeeth.includes(31) ? t31G :t31} alt="kid"/>
                        <img onClick={() => handleTeethClick(32)} className={style["t42"]}
                             src={allToothProblems.includes(32) ? t32P : allExtractedTeeth.includes(32) ? t32G :t32} alt="kid"/>
                    </div>

                    <div className={style["lastDownPart"]}>
                        <img onClick={() => handleTeethClick(33)} className={style["t43"]}
                             src={allToothProblems.includes(33) ? t33P : allExtractedTeeth.includes(33) ? t33G :t33} alt="kid"/>
                        <img onClick={() => handleTeethClick(34)} className={style["t44"]}
                             src={allToothProblems.includes(34) ? t34P : allExtractedTeeth.includes(34) ? t34G :t34} alt="kid"/>
                        <img onClick={() => handleTeethClick(35)} className={style["t45"]}
                             src={allToothProblems.includes(35) ? t35P : allExtractedTeeth.includes(35) ? t35G :t35} alt="kid"/>
                        <img onClick={() => handleTeethClick(36)} className={style["t46"]}
                             src={allToothProblems.includes(36) ? t36P : allExtractedTeeth.includes(36) ? t36G :t36} alt="kid"/>
                        <img onClick={() => handleTeethClick(37)} className={style["t47"]}
                             src={allToothProblems.includes(37) ? t37P : allExtractedTeeth.includes(37) ? t37G :t37} alt="kid"/>
                        <img onClick={() => handleTeethClick(38)} className={style["t48"]}
                             src={allToothProblems.includes(38) ? t38P : allExtractedTeeth.includes(38) ? t38G :t38} alt="kid"/>
                    </div>
                </div>
            </div>
    ):(
            <div className={style["status"]}>
                <div className={style["upperPartT"]}>
                    <div className={style["firstUpperPartT"]}>
                        <img onClick={() => handleTeethClick(55)} className={style["t15T"]}
                             src={allToothProblems.includes(55) ? t15P : allExtractedTeeth.includes(55) ? t15G :t15} alt="kid"/>
                        <img onClick={() => handleTeethClick(54)} className={style["t14T"]}
                             src={allToothProblems.includes(54) ? t14P : allExtractedTeeth.includes(54) ? t14G :t14} alt="kid"/>
                        <img onClick={() => handleTeethClick(53)} className={style["t13T"]}
                             src={allToothProblems.includes(53) ? t13P : allExtractedTeeth.includes(53) ? t13G :t13} alt="kid"/>
                    </div>
                    <div className={style["upperMiddlePartT"]}>
                        <img onClick={() => handleTeethClick(52)} className={style["t12T"]}
                             src={allToothProblems.includes(52) ? t12P : allExtractedTeeth.includes(52) ? t12G :t12} alt="kid"/>
                        <img onClick={() => handleTeethClick(51)} className={style["t11T"]}
                             src={allToothProblems.includes(51) ? t11P : allExtractedTeeth.includes(51) ? t11G :t11} alt="kid"/>
                        <img onClick={() => handleTeethClick(61)} className={style["t21T"]}
                             src={allToothProblems.includes(61) ? t21P : allExtractedTeeth.includes(61) ? t21G :t21} alt="kid"/>
                        <img onClick={() => handleTeethClick(62)} className={style["t22T"]}
                             src={allToothProblems.includes(62) ? t22P : allExtractedTeeth.includes(62) ? t22G :t22} alt="kid"/>
                    </div>
                    <div className={style["lastUpperPartT"]}>
                        <img onClick={() => handleTeethClick(63)} className={style["t23T"]}
                             src={allToothProblems.includes(63) ? t23P : allExtractedTeeth.includes(63) ? t23G :t23} alt="kid"/>
                        <img onClick={() => handleTeethClick(64)} className={style["t24T"]}
                             src={allToothProblems.includes(64) ? t24P : allExtractedTeeth.includes(64) ? t24G :t24} alt="kid"/>
                        <img onClick={() => handleTeethClick(65)} className={style["t25T"]}
                             src={allToothProblems.includes(65) ? t25P : allExtractedTeeth.includes(65) ? t25G :t25} alt="kid"/>
                    </div>
                </div>
                <div className={style["oblique-lineT"]}></div>
                <div className={style["downPart"]}>
                    <div className={style["firstDownPartT"]}>
                        <img onClick={() => handleTeethClick(85)} className={style["t35T"]}
                             src={allToothProblems.includes(85) ? t35P : allExtractedTeeth.includes(85) ? t35G :t35} alt="kid"/>
                        <img onClick={() => handleTeethClick(84)} className={style["t34T"]}
                             src={allToothProblems.includes(84) ? t34P : allExtractedTeeth.includes(84) ? t34G :t34} alt="kid"/>
                        <img onClick={() => handleTeethClick(83)} className={style["t33T"]}
                             src={allToothProblems.includes(83) ? t33P : allExtractedTeeth.includes(83) ? t33G :t33} alt="kid"/>
                    </div>

                    <div className={style["middleDownPartT"]}>
                        <img onClick={() => handleTeethClick(82)} className={style["t32T"]}
                             src={allToothProblems.includes(82) ? t32P : allExtractedTeeth.includes(82) ? t32G :t32} alt="kid"/>
                        <img onClick={() => handleTeethClick(81)} className={style["t31T"]}
                             src={allToothProblems.includes(81) ? t31P : allExtractedTeeth.includes(81) ? t31G :t31} alt="kid"/>
                        <img onClick={() => handleTeethClick(71)} className={style["t41T"]}
                             src={allToothProblems.includes(71) ? t41P : allExtractedTeeth.includes(71) ? t41G :t41} alt="kid"/>
                        <img onClick={() => handleTeethClick(72)} className={style["t42T"]}
                             src={allToothProblems.includes(72) ? t42P : allExtractedTeeth.includes(72) ? t42G :t42} alt="kid"/>
                    </div>

                    <div className={style["lastDownPartT"]}>
                        <img onClick={() => handleTeethClick(73)} className={style["t43T"]}
                             src={allToothProblems.includes(73) ? t43P : allExtractedTeeth.includes(73) ? t43G :t43} alt="kid"/>
                        <img onClick={() => handleTeethClick(74)} className={style["t44T"]}
                             src={allToothProblems.includes(74) ? t44P : allExtractedTeeth.includes(74) ? t44G :t44} alt="kid"/>
                        <img onClick={() => handleTeethClick(75)} className={style["t45T"]}
                             src={allToothProblems.includes(75) ? t45P : allExtractedTeeth.includes(75) ? t45G :t45} alt="kid"/>
                    </div>
                </div>
            </div>
    )}
            <div className={style["details"]}>

                <div className={style["headPart"]}>
                    <div className={`${style["switch"]} flex items-center gap-2`}>
                        <Switch
                            checked={isToggled}
                            onCheckedChange={handleToggle}
                            id="dentition-switch-1"
                        />
                        <Label htmlFor="dentition-switch-1">Dentiție temporară</Label>
                    </div>
                </div>
                {selectedTeeth === null ?
                    (
                        <div>
                            <p className={style["text-no"]}>
                                Selectati un dinte pentru a afla mai multe detalii despre acesta.
                            </p>
                        </div>
                    ) : (
                        <div className={style.tooth_details}>
                            <p className={style.tooth_details_title}> Detaliile dintelui {selectedTeeth}</p>
                            <div className={`${style["switch"]} flex items-center gap-2`}>
                                <Switch
                                    checked={chooseIsExtractedSelectedTeeth}
                                    onCheckedChange={(checked) => handleChooseIsExtracting({ target: { checked } })}
                                    id="extracted-switch"
                                />
                                <Label htmlFor="extracted-switch">Dinte extras</Label>
                            </div>
                            <div className={style["history"]}>
                                <h4 className={style["history_title"]}>Istoric intervenții</h4>
                                <div className={style["teeth-history"]}>
                                    {
                                        Array.isArray(teethHistory) && teethHistory.length > 0 ? (
                                            teethHistory.map((intervention) => (

                                                <li
                                                    key={intervention.interventionId}
                                                    onClick={() => handleInterventionClick(intervention)}
                                                    className={style[selectedIntervention && selectedIntervention.interventionId === intervention.interventionId ? 'active' : "list-element"]}
                                                >
                                                    <div className={style['intervention']}>
                                                        <div className={style['left-part']}>
                                                            <CalendarIcon className="h-5 w-5 text-cyan-600" />
                                                            <p>{intervention.dateIntervention}</p>
                                                        </div>
                                                        <div className={style['icons']}>
                                                            <TrashIcon className="h-5 w-5 text-cyan-600 cursor-pointer"
                                                                 onClick={() => openConfirmDeleteIntervention()}/>
                                                            <Pencil2Icon className="h-5 w-5 text-cyan-600 cursor-pointer"
                                                                 onClick={() => startEditIntervention(intervention)}/>
                                                        </div>
                                                    </div>
                                                </li>

                                            ))
                                        ) : (
                                            <div>
                                                <p className={style["text-no"]}>Nu există nici o intervenție asupra
                                                    acestui dinte</p>
                                            </div>
                                        )
                                    }
                                </div>
                                {selectedIntervention && (
                                    <div className={style["intervention-details"]}>
                                        {editingIntervention ? (
                                            <form className={style["edit-intervention-form"]}
                                                  onSubmit={(e) => handleEditIntervention(e)}>
                                                <h3 className={styles.editTitle}>Editare Intervenție</h3>
                                                <textarea
                                                    className={style["textarea"]}
                                                    value={editDetails}
                                                    onChange={(e) => setEditDetails(e.target.value)}
                                                    placeholder="Modificați observațiile..."
                                                />
                                                <div className={style["edit-buttons"]}>
                                                    <button type="submit" className={styles["btn-save"]}>Salvează
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles["btn-cancel"]}
                                                        onClick={cancelEditIntervention}
                                                    >
                                                        Renunță
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className={style["details-box"]}>
                                                <p className={style["details-text"]}>
                                                    Detalii Intervenție:
                                                </p>
                                                <p className={style["details-text"]}>{selectedIntervention.interventionDetails}</p>
                                            </div>
                                        )
                                        }
                                    </div>

                                )}
                                {
                                    showAddNewIntervention && (
                                        <form className={style["addNewInterventionForm"]} onSubmit={(e)=>handleSubmit("false",e)}>
                                            <h3>Intervenție nouă</h3>
                                            <div className={style["newInterventionsDetails"]}>
                                                <label> Observații:</label>
                                                <input className={style["input"]}
                                                       type="text"
                                                       placeholder="Observații"
                                                       name="observations"
                                                       value={newInterventionDetails}
                                                       onChange={(e) => setNewInterventionDetails(e.target.value)} // Modificăm aici
                                                />
                                            </div>
                                            <div className={style["buttons"]}>
                                                <button type="submit" className={style.submitButton}>Adaugă intervenție
                                                </button>
                                                <button className={style["closeButton"]}
                                                        onClick={cancelShowNewIntervention}>Închide
                                                </button>
                                            </div>
                                        </form>

                                    )
                                }
                                <div className={style["add-new"]}>
                                    <button onClick={() => handleShowNewIntervention()}
                                            className={style["add-new-intervention-button"]}>Adaugă intervenție nouă
                                    </button>
                                </div>
                            </div>
                            <Dialog open={showConfirmDeleteIntervention} onOpenChange={closeConfirmationDeleteIntervention}>
                                <DialogContent className={styles.box}>
                                    <DialogHeader>
                                        <DialogTitle className={styles.changeRolT}>Confirmare</DialogTitle>
                                    </DialogHeader>
                                    <p className={styles.text}>
                                        Ești sigur că dorești să ștergi acestă intervenție?
                                    </p>
                                    <button className={styles.actionButton} onClick={()=>handleDeleteIntervention(selectedIntervention)}>
                                        Da, șterge intervenție
                                    </button>
                                    <button onClick={closeConfirmationDeleteIntervention}>Anulează</button>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={showDeleteIntervention} onOpenChange={closeDeleteIntervention}>
                                <DialogContent className={styles.box}>
                                    <p className={styles.changeRolT}>Intervenția a fost ștearsă</p>
                                </DialogContent>
                            </Dialog>
                            <div className={style["problems"]}>
                                <h4 className={style["history_title"]}>Probleme actuale</h4>
                                <div className={style["teeth-history"]}>
                                    {
                                        Array.isArray(teethProblems) && teethProblems.length > 0 ? (
                                            teethProblems.map((problem) => (
                                                <li
                                                    key={problem.problemId}
                                                    onClick={() => handleProblemClick(problem)}
                                                    className={style[selectedProblem && selectedProblem.problemId === problem.problemId ? 'active' : "list-element"]}
                                                >
                                                    <div className={style['intervention']}>
                                                        <div className={style['left-part']}>
                                                            <CalendarIcon className="h-5 w-5 text-cyan-600" />
                                                            <p>{problem.dateProblem}</p>
                                                        </div>
                                                        <div className={style['icons']}>
                                                            <TrashIcon className="h-5 w-5 text-cyan-600 cursor-pointer"
                                                                 onClick={() => openConfirmDeleteProblem()}/>
                                                            <Pencil2Icon className="h-5 w-5 text-cyan-600 cursor-pointer"
                                                                 onClick={() => startEditProblem(problem)}/>
                                                        </div>
                                                    </div>
                                                </li>

                                            ))
                                        ) : (
                                            <div>
                                                <p className={style["text-no"]}>Nu exista nici o problema la acest dinte</p>
                                            </div>
                                        )
                                    }
                                </div>
                                {selectedProblem && (
                                    <div className={style["intervention-details"]}>
                                        {editingProblem ? (
                                            <form className={style["edit-intervention-form"]}
                                                  onSubmit={(e) => handleEditProblem(e)}>
                                                <h3 className={styles.editTitle}>Editare Problemă</h3>
                                                <textarea
                                                    className={style["textarea"]}
                                                    value={editProblems}
                                                    onChange={(e) => setEditProblems(e.target.value)}
                                                    placeholder="Modificați observațiile..."
                                                />
                                                <div className={style["edit-buttons"]}>
                                                    <button type="submit" className={styles["btn-save"]}>Salvează
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={styles["btn-cancel"]}
                                                        onClick={cancelEditProblem}
                                                    >
                                                        Renunță
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <div className={style["details-box"]}>
                                                <p className={style["details-text"]}>
                                                    Detalii Problemă:
                                                </p>
                                                <p className={style["details-text"]}>{selectedProblem.problemDetails}</p>
                                            </div>
                                        )
                                        }
                                    </div>
                                )}
                                {
                                    showAddNewProblem && (
                                        <form className={style["addNewInterventionForm"]} onSubmit={handleAddNewProblem}>
                                            <h3 className={styles.editTitle}>Problemă nouă</h3>
                                            <div className={style["newInterventionsDetails"]}>
                                                <label> Observații:</label>
                                                <input className={style["input"]}
                                                       type="text"
                                                       placeholder="Observații"
                                                       name="observations"
                                                       value={newProblemDetails}
                                                       onChange={(e) => setNewProblemDetails(e.target.value)} // Modificăm aici
                                                />
                                            </div>
                                            <div className={style["buttons"]}>
                                                <button type="submit" className={style["submitButton"]}>Adaugă Problema
                                                </button>
                                                <button className={style["closeButton"]}
                                                        onClick={cancelShowNewProblem}>Închide
                                                </button>
                                            </div>
                                        </form>

                                    )
                                }
                                <Dialog open={showConfirmDeleteProblem} onOpenChange={closeConfirmationDeleteProblem}>
                                    <DialogContent className={styles.box}>
                                        <DialogHeader>
                                            <DialogTitle className={styles.changeRolT}>Confirmare</DialogTitle>
                                        </DialogHeader>
                                        <p className={styles.text}>
                                            Ești sigur că dorești să ștergi acestă problemă?
                                        </p>
                                        <button className={styles.actionButton} onClick={()=>handleDeleteProblem(selectedProblem)}>
                                            Da, șterge problemă
                                        </button>
                                        <button onClick={closeConfirmationDeleteProblem}>Anulează</button>
                                    </DialogContent>
                                </Dialog>
                                <Dialog open={showDeleteProblem} onOpenChange={closeDeleteProblem}>
                                    <DialogContent className={styles.box}>
                                        <p className={styles.text}>
                                            Problema a fost ștearsă
                                        </p>
                                    </DialogContent>
                                </Dialog>
                                <div className={style["add-new"]}>
                                    <button onClick={() => handleShowNewProblem()}
                                            className={style["add-new-intervention-button"]}>Adaugă problemă nouă
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                <Dialog open={showError} onOpenChange={closeErrorMessage}>
                    <DialogContent className={styles.box}>
                        <p className={styles.text}>
                            {errorMessage}
                        </p>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

export default PatientStatus;
