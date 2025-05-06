import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { insurance } from "../subjects/insurance";
import { awsCertifications } from "../subjects/awsCertifications";
import { taxProfessional } from "../subjects/taxProfessional";

// List of available subjects
const subjects = [insurance, awsCertifications, taxProfessional];

const SubjectContext = createContext(null);

export function SubjectProvider({ children }) {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const { user, token } = useAuth();

  // Load user preference on login
  useEffect(() => {
    if (user && token) {
      // Check if we're using mock auth
      if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
        // Use user preferences from mock data if available
        if (user.preferences?.currentSubject) {
          const savedSubject = subjects.find(s => s.name === user.preferences.currentSubject);
          if (savedSubject) {
            setSelectedSubject(savedSubject);
          }
        }
      } else {
        // Fetch from API
        fetch(`${import.meta.env.VITE_API_URL}/api/user-preference`, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        })
        .then(response => {
          if (response.ok) return response.json();
          throw new Error('Failed to fetch subject preference');
        })
        .then(data => {
          if (data.currentSubject) {
            const savedSubject = subjects.find(s => s.name === data.currentSubject);
            if (savedSubject) {
              setSelectedSubject(savedSubject);
            }
          }
        })
        .catch(err => console.error("Failed to load subject preference:", err));
      }
    }
  }, [user, token]);

  // Save preference when it changes
  useEffect(() => {
    if (user && token && selectedSubject) {
      // Check if we're using mock auth
      if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
        // In mock mode, we don't need to save preferences
        console.log("Mock mode: Would save subject preference:", selectedSubject.name);
      } else {
        // Save to API
        fetch(`${import.meta.env.VITE_API_URL}/api/user-preference`, {
          method: 'POST',
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ currentSubject: selectedSubject.name })
        }).catch(err => console.error("Failed to save subject preference:", err));
      }
    }
  }, [selectedSubject, user, token]);
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
