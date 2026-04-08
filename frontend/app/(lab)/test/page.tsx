"use client"
import ModalHeader from "@/components/Modal/ModalHeader";
import { useState } from "react";
import ClinicalChemistryModal from "@/components/Modal/LabModal/ClinicalChemistryModal";
import GeneralResultModal from "@/components/Modal/LabModal/GeneralResultModal";
import HematologyModal from "@/components/Modal/LabModal/HematologyModal";
import LabResultPreview from "@/components/Modal/LabModal/LabResultPreview";
import SerologyModal from "@/components/Modal/LabModal/OGTTResultModal";
import UrinalysisModal from "@/components/Modal/LabModal/UrinalysisModal";
import Button from "@/components/ui/Button";




const DashboardPage = () => {
    const [close, setClose] = useState<boolean>(false);

    const closeModal = () => {
        setClose(false);
    }

    const openModal = () => {
        setClose(true);
    }

    return (
        
        <>{close && ( <ModalHeader showModal={close} title="Laboratory Request" onClose={closeModal}><SerologyModal/></ModalHeader>)}
        <div className="p-6">
           <button type="button" className="p-3 border border-1 hover:bg-gray-500" onClick={openModal}>
                Laboratory Request
            </button>
            
        </div>
        </>
    );
}

export default DashboardPage;