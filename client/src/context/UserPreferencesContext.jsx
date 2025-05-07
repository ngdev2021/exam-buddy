import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserPreferencesContext = createContext();

export function UserPreferencesProvider({ children }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    tutorName: null,
    userName: null,
    tutorPersonality: 'southern', // Default personality
    hasGreeted: false,
    lastVisitedTopics: []
  });

  // Load preferences from localStorage when component mounts or user changes
  useEffect(() => {
    if (user) {
      const storedPreferences = localStorage.getItem(`preferences_${user.id}`);
      if (storedPreferences) {
        try {
          setPreferences(JSON.parse(storedPreferences));
        } catch (error) {
          console.error('Failed to parse stored preferences', error);
        }
      }
    }
  }, [user]);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (user && preferences) {
      localStorage.setItem(`preferences_${user.id}`, JSON.stringify(preferences));
    }
  }, [preferences, user]);

  // Update a specific preference
  const updatePreference = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Set the user's name
  const setUserName = (name) => {
    updatePreference('userName', name);
  };

  // Set the tutor's name
  const setTutorName = (name) => {
    updatePreference('tutorName', name);
  };

  // Set whether the tutor has greeted the user
  const setHasGreeted = (value) => {
    updatePreference('hasGreeted', value);
  };

  // Add a topic to the recently visited list
  const addVisitedTopic = (topic) => {
    if (!topic) return;
    
    setPreferences(prev => {
      // Remove the topic if it already exists
      const filteredTopics = prev.lastVisitedTopics.filter(t => t !== topic);
      // Add the topic to the beginning of the array
      const updatedTopics = [topic, ...filteredTopics].slice(0, 5); // Keep only the 5 most recent
      
      return {
        ...prev,
        lastVisitedTopics: updatedTopics
      };
    });
  };

  // Get southern greeting phrases
  const getSouthernGreeting = () => {
    const greetings = [
      "Well hey there, sugar!",
      "Howdy, darlin'!",
      "Well bless your heart, welcome!",
      "Hey y'all!",
      "How're you doin', honey?",
      "Well I'll be! So good to see you!"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // Get southern encouragement phrases
  const getSouthernEncouragement = () => {
    const phrases = [
      "You're doin' just fine, sugar!",
      "Bless your heart, you're makin' great progress!",
      "Well aren't you just as smart as can be!",
      "You're catchin' on faster than a fox in a henhouse!",
      "Sweet pea, you're gettin' this quicker than most!",
      "My goodness, you've got a good head on your shoulders!"
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  // Get southern sympathy phrases
  const getSouthernSympathy = () => {
    const phrases = [
      "Don't you worry 'bout a thing, honey.",
      "Bless your heart, we'll figure this out together.",
      "Now don't you fret, sugar. This stuff is tricky!",
      "Even the smartest folks struggle with this sometimes.",
      "We'll take it nice and slow, no rush at all.",
      "It's alright to find this difficult, darlin'. That's what I'm here for!"
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  };

  return (
    <UserPreferencesContext.Provider value={{
      preferences,
      setUserName,
      setTutorName,
      setHasGreeted,
      addVisitedTopic,
      getSouthernGreeting,
      getSouthernEncouragement,
      getSouthernSympathy
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  return useContext(UserPreferencesContext);
}
