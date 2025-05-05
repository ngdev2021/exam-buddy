import React, { createContext, useContext, useState } from "react";
import { insurance } from "../subjects/insurance";
import { awsCertifications } from "../subjects/awsCertifications";
import { taxProfessional } from "../subjects/taxProfessional";

// List of available subjects
const subjects = [insurance, awsCertifications, taxProfessional];

const SubjectContext = createContext(null);

export function SubjectProvider({ children }) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  return (
    <SubjectContext.Provider value={{ subjects, selectedSubject, setSelectedSubject }}>
      {children}
    </SubjectContext.Provider>
  );
}

export function useSubject() {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error("useSubject must be used within a SubjectProvider");
  }
  return context;
}
