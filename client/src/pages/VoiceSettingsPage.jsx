import React, { useState, useEffect } from 'react';
import { useVoice } from '../context/VoiceContext';
import axios from 'axios';

const VoiceSettingsPage = () => {
  const { isSpeechRecognitionSupported } = useVoice();
  const [settings, setSettings] = useState({
    defaultCulturalVocabularyMode: false,
    defaultCulturalVocabularyType: 'standard',
    voiceCommandsEnabled: true,
    autoPlayInstructions: true,
    voiceSpeed: 1.0,
    voicePitch: 1.0,
    preferredVoice: 'default',
    saveTranscripts: true
  });
  const [availableVoices, setAvailableVoices] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Fetch user's voice settings on component mount
  useEffect(() => {
    fetchVoiceSettings();
    getAvailableVoices();
  }, []);

  // Get available voices from the browser
  const getAvailableVoices = () => {
    if ('speechSynthesis' in window) {
      // Get the available voices
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      } else {
        // If voices aren't loaded yet, wait for the voiceschanged event
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          setAvailableVoices(updatedVoices);
        };
      }
    }
  };

  // Fetch user's voice settings from the server
  const fetchVoiceSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // In a real implementation, this would call an API to get user settings
      // For now, we'll use localStorage as a simple storage mechanism
      const savedSettings = localStorage.getItem('voicePreferences');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error fetching voice settings:', error);
    }
  };

  // Save user's voice settings
  const saveVoiceSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSaveStatus({ type: 'error', message: 'Authentication required' });
        return;
      }

      // In a real implementation, this would call an API to save user settings
      // For now, we'll use localStorage as a simple storage mechanism
      
      // Save to voicePreferences to match what's used in VoiceContext
      localStorage.setItem('voicePreferences', JSON.stringify({
        ...settings,
        // Add additional properties needed by VoiceContext
        rate: settings.voiceSpeed,
        pitch: settings.voicePitch,
        culturalStyle: settings.defaultCulturalVocabularyType
      }));

      setSaveStatus({ type: 'success', message: 'Settings saved successfully' });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving voice settings:', error);
      setSaveStatus({ type: 'error', message: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Test voice settings
  const testVoiceSettings = () => {
    if ('speechSynthesis' in window) {
      // Create a test message that includes cultural vocabulary examples if enabled
      let testMessage = "This is a test of your voice settings. ";
      
      // Add cultural vocabulary example if enabled
      if (settings.defaultCulturalVocabularyMode) {
        switch(settings.defaultCulturalVocabularyType) {
          case 'aave':
            testMessage += "With AAVE vocabulary enabled, I can recognize phrases like 'finna' and 'y'all'. ";
            break;
          case 'southern':
            testMessage += "With Southern vocabulary enabled, I can recognize phrases like 'y'all' and 'fixin' to'. ";
            break;
          case 'latino':
            testMessage += "With Latino vocabulary enabled, I can recognize Spanglish terms like 'mijo' and 'órale'. ";
            break;
          case 'caribbean':
            testMessage += "With Caribbean vocabulary enabled, I can recognize phrases like 'wah gwaan' and 'irie'. ";
            break;
          case 'midwest':
            testMessage += "With Midwest vocabulary enabled, I can recognize phrases like 'ope' and 'you betcha'. ";
            break;
          default:
            testMessage += `Your cultural vocabulary mode is set to ${settings.defaultCulturalVocabularyType}. `;
        }
      } else {
        testMessage += "Cultural vocabulary mode is disabled. ";
      }
      
      testMessage += `Your voice speed is set to ${settings.voiceSpeed} and pitch is set to ${settings.voicePitch}.`;
      
      // Create a new SpeechSynthesisUtterance instance
      const utterance = new SpeechSynthesisUtterance(testMessage);
      
      // Set voice properties
      utterance.rate = settings.voiceSpeed;
      utterance.pitch = settings.voicePitch;
      
      // Set voice if not default
      if (settings.preferredVoice !== 'default') {
        const selectedVoice = availableVoices.find(voice => voice.name === settings.preferredVoice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      // Speak the utterance
      window.speechSynthesis.speak(utterance);
    }
  };

  // Cultural vocabulary options
  const culturalVocabularyOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'aave', label: 'AAVE (African American Vernacular English)' },
    { value: 'southern', label: 'Southern Slang' },
    { value: 'latino', label: 'Latino/Spanglish' },
    { value: 'caribbean', label: 'Caribbean/Creole' }
  ];

  return (
    <div className="container-layout pb-20">
      <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">Voice Settings</h1>
      
      {!isSpeechRecognitionSupported() ? (
        <div className="card p-6 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200">
          <h2 className="text-lg font-semibold mb-2">Speech Recognition Not Supported</h2>
          <p>Your browser does not support speech recognition. Please try using a modern browser like Chrome, Edge, or Safari.</p>
        </div>
      ) : (
        <>
          <form className="space-y-6">
            {/* Cultural Vocabulary Settings */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Cultural Vocabulary Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="defaultCulturalVocabularyMode"
                    name="defaultCulturalVocabularyMode"
                    checked={settings.defaultCulturalVocabularyMode}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="defaultCulturalVocabularyMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Cultural Vocabulary Support by Default
                  </label>
                </div>
                
                {settings.defaultCulturalVocabularyMode && (
                  <div>
                    <label htmlFor="defaultCulturalVocabularyType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cultural Vocabulary Type
                    </label>
                    <select
                      id="defaultCulturalVocabularyType"
                      name="defaultCulturalVocabularyType"
                      value={settings.defaultCulturalVocabularyType}
                      onChange={handleInputChange}
                      disabled={!settings.defaultCulturalVocabularyMode}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {culturalVocabularyOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Cultural vocabulary improves recognition of diverse speech patterns and dialectal variations
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Voice Command Settings */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Voice Command Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="voiceCommandsEnabled"
                    name="voiceCommandsEnabled"
                    checked={settings.voiceCommandsEnabled}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="voiceCommandsEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Voice Commands
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveTranscripts"
                    name="saveTranscripts"
                    checked={settings.saveTranscripts}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="saveTranscripts" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Save Voice Transcripts for Improvement
                  </label>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Voice commands allow you to navigate and control the application using your voice.
                  Example commands: "Go to dashboard", "Start practice", "Start flashcards".
                </p>
              </div>
            </div>
            
            {/* Voice Output Settings */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Voice Output Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoPlayInstructions"
                    name="autoPlayInstructions"
                    checked={settings.autoPlayInstructions}
                    onChange={handleInputChange}
                    className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="autoPlayInstructions" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Auto-Play Instructions and Questions
                  </label>
                </div>
                
                <div>
                  <label htmlFor="voiceSpeed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Voice Speed: {settings.voiceSpeed}x
                  </label>
                  <input
                    type="range"
                    id="voiceSpeed"
                    name="voiceSpeed"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voiceSpeed}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label htmlFor="voicePitch" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Voice Pitch: {settings.voicePitch}
                  </label>
                  <input
                    type="range"
                    id="voicePitch"
                    name="voicePitch"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voicePitch}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
                
                <div>
                  <label htmlFor="preferredVoice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preferred Voice
                  </label>
                  <select
                    id="preferredVoice"
                    name="preferredVoice"
                    value={settings.preferredVoice}
                    onChange={handleInputChange}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="default">Browser Default</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="british">British</option>
                    <option value="australian">Australian</option>
                    <option value="indian">Indian</option>
                    {availableVoices.map(voice => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Select a voice style or a specific voice from your browser
                  </p>
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={testVoiceSettings}
                    className="btn-secondary"
                  >
                    Test Voice Settings
                  </button>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveVoiceSettings}
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
            
            {/* Save Status */}
            {saveStatus && (
              <div className={`p-4 rounded-md ${
                saveStatus.type === 'success' 
                  ? 'bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {saveStatus.message}
              </div>
            )}
          </form>
          
          {/* Instructions */}
          <div className="mt-8 card p-6">
            <h2 className="text-lg font-semibold mb-2">About Voice Settings</h2>
            <div className="space-y-2 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Cultural Vocabulary Support:</strong> Improves speech recognition for diverse speech patterns and dialectal variations.
              </p>
              <p>
                <strong>Voice Commands:</strong> Allow you to navigate and control the application using your voice.
              </p>
              <p>
                <strong>Voice Output:</strong> Configure how the application speaks to you, including speed, pitch, and voice type.
              </p>
              <p>
                <strong>Privacy Note:</strong> Voice transcripts may be saved to improve our speech recognition system. You can disable this in the settings above.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceSettingsPage;
