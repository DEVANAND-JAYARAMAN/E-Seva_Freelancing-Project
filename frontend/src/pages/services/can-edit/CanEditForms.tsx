import React from "react";
import { NewCanRegistrationForm } from "./NewCanRegistrationForm";
import { NameCorrectionForm } from "./NameCorrectionForm";
import { DobCorrectionForm } from "./DobCorrectionForm";
import { MobileNumberForm } from "./MobileNumberForm";
import { CanDeleteForm } from "./CanDeleteForm";
import { CertificateFindForm } from "./CertificateFindForm";
import { LegalHeirCertNoForm } from "./LegalHeirCertNoForm";
import { FindCanNumberForm } from "./FindCanNumberForm";
import { NameCellNumberForm } from "./NameCellNumberForm";
import { NameDobForm } from "./NameDobForm";
import { CellNumberDobForm } from "./CellNumberDobForm";
import { NameCellNumberDobForm } from "./NameCellNumberDobForm";
import { SavedAppRemovedForm } from "./SavedAppRemovedForm";
import { ReturnAppRemovedForm } from "./ReturnAppRemovedForm";
import { FatherNameCorrectionForm } from "./FatherNameCorrectionForm";
import { AddressCorrectionForm } from "./AddressCorrectionForm";

interface CanEditFormsProps {
  serviceId: string;
  serviceName: string;
  onCancel: () => void;
}

export const CanEditForms: React.FC<CanEditFormsProps> = ({
  serviceId,
  serviceName,
  onCancel,
}) => {
  switch (serviceId) {
    case "new-can-reg":
      return <NewCanRegistrationForm onCancel={onCancel} />;
    case "name-correction":
      return <NameCorrectionForm onCancel={onCancel} />;
    case "dob-correction":
      return <DobCorrectionForm onCancel={onCancel} />;
    case "mobile-number":
      return <MobileNumberForm onCancel={onCancel} />;
    case "can-delete":
      return <CanDeleteForm onCancel={onCancel} />;
    case "certificate-find":
      return <CertificateFindForm onCancel={onCancel} />;
    case "legal-heir-cert-no":
      return <LegalHeirCertNoForm onCancel={onCancel} />;
    case "find-can-number":
      return <FindCanNumberForm onCancel={onCancel} />;
    case "name-cell-number":
      return <NameCellNumberForm onCancel={onCancel} />;
    case "name-dob":
      return <NameDobForm onCancel={onCancel} />;
    case "cell-number-dob":
      return <CellNumberDobForm onCancel={onCancel} />;
    case "name-cell-number-dob":
      return <NameCellNumberDobForm onCancel={onCancel} />;
    case "saved-app-removed":
      return <SavedAppRemovedForm onCancel={onCancel} />;
    case "return-app-removed":
      return <ReturnAppRemovedForm onCancel={onCancel} />;
    case "father-name-correction":
      return <FatherNameCorrectionForm onCancel={onCancel} />;
    case "address-correction":
      return <AddressCorrectionForm onCancel={onCancel} />;
    default:
      return null;
  }
};
