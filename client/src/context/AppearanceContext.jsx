import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const AppearanceContext = createContext(null);

export function AppearanceProvider({ children }) {
  const { user, token, updateUser } = useAuth();
  const [appearanceSettings, setAppearanceSettings] = useState({
    highContrast: false,
    largeText: false,
    reduceMotion: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load appearance settings from user data
  useEffect(() => {
    if (user && user.preferences) {
      setAppearanceSettings({
        highContrast: user.preferences.highContrast || false,
        largeText: user.preferences.largeText || false,
        reduceMotion: user.preferences.reduceMotion || false
      });
    }
  }, [user]);

  // Apply appearance settings to the document
  useEffect(() => {
    // Apply high contrast
    if (appearanceSettings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply large text
    if (appearanceSettings.largeText) {
      document.documentElement.classList.add('large-text');
    } else {
      document.documentElement.classList.remove('large-text');
    }

    // Apply reduced motion
    if (appearanceSettings.reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [appearanceSettings]);

  // Update appearance settings
  const updateAppearanceSettings = async (newSettings) => {
    setIsLoading(true);
    try {
      const updatedSettings = { ...appearanceSettings, ...newSettings };
      setAppearanceSettings(updatedSettings);

      // If user is logged in, save to profile
      if (user && token) {
        const updatedPreferences = {
          ...user.preferences,
          ...updatedSettings
        };

        await updateUser({ preferences: updatedPreferences });
      }

      return true;
    } catch (error) {
      console.error("Failed to update appearance settings:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppearanceContext.Provider 
      value={{ 
        appearanceSettings, 
        updateAppearanceSettings,
        isLoading
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) {
    throw new Error("useAppearance must be used within an AppearanceProvider");
  }
  return context;
}
