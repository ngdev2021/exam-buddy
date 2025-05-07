import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../../context/VoiceContext';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';

const VoiceCommandHandler = ({ isVisible = true }) => {
  const { startListening, stopListening, transcript, isListening } = useVoice();
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [commandFeedback, setCommandFeedback] = useState('');
  const navigate = useNavigate();

  // Process voice commands
  const processCommand = useCallback((command) => {
    if (!command) return false;
    
    const normalizedCommand = command.toLowerCase().trim();
    let commandRecognized = false;
    
    // Navigation commands
    if (normalizedCommand.includes('go to home') || normalizedCommand.includes('navigate to home')) {
      navigate('/');
      setCommandFeedback('Navigating to Home page');
      commandRecognized = true;
    } 
    else if (normalizedCommand.includes('go to practice') || normalizedCommand.includes('navigate to practice')) {
      navigate('/practice');
      setCommandFeedback('Navigating to Practice page');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('go to test') || normalizedCommand.includes('navigate to test')) {
      navigate('/test');
      setCommandFeedback('Navigating to Test Mode page');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('go to dashboard') || normalizedCommand.includes('navigate to dashboard')) {
      navigate('/dashboard');
      setCommandFeedback('Navigating to Dashboard page');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('go to calculator') || normalizedCommand.includes('navigate to calculator')) {
      navigate('/calculator');
      setCommandFeedback('Navigating to Calculator page');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('go to voice cards') || 
             normalizedCommand.includes('navigate to voice cards') ||
             normalizedCommand.includes('go to flashcards') || 
             normalizedCommand.includes('navigate to flashcards')) {
      navigate('/voice-flashcards');
      setCommandFeedback('Navigating to Voice Flashcards page');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('go to voice exam') || 
             normalizedCommand.includes('navigate to voice exam') ||
             normalizedCommand.includes('go to oral exam') || 
             normalizedCommand.includes('navigate to oral exam')) {
      navigate('/voice-exam');
      setCommandFeedback('Navigating to Voice Exam page');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('go to profile') || normalizedCommand.includes('navigate to profile')) {
      navigate('/profile');
      setCommandFeedback('Navigating to Profile page');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('go to settings') || normalizedCommand.includes('navigate to settings')) {
      navigate('/settings');
      setCommandFeedback('Navigating to Settings page');
      commandRecognized = true;
    }
    
    // Action commands
    else if (normalizedCommand.includes('start practice') || normalizedCommand.includes('begin practice')) {
      navigate('/practice');
      setCommandFeedback('Starting practice mode');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('start test') || normalizedCommand.includes('begin test')) {
      navigate('/test');
      setCommandFeedback('Starting test mode');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('start flashcards') || normalizedCommand.includes('begin flashcards')) {
      navigate('/voice-flashcards');
      setCommandFeedback('Starting voice flashcards');
      commandRecognized = true;
    }
    else if (normalizedCommand.includes('start exam') || normalizedCommand.includes('begin exam')) {
      navigate('/voice-exam');
      setCommandFeedback('Starting voice exam');
      commandRecognized = true;
    }
    
    // Help command
    else if (normalizedCommand.includes('what can i say') || 
             normalizedCommand.includes('show commands') || 
             normalizedCommand.includes('help')) {
      setCommandFeedback('Available commands: "Go to [page name]", "Start practice", "Start test", "Start flashcards", "Start exam"');
      commandRecognized = true;
    }
    
    return commandRecognized;
  }, [navigate]);

  // Listen for transcript changes and process commands
  useEffect(() => {
    if (isCommandMode && transcript) {
      const commandRecognized = processCommand(transcript);
      
      if (!commandRecognized) {
        setCommandFeedback(`Command not recognized: "${transcript}"`);
      }
      
      // Exit command mode after processing
      setTimeout(() => {
        setIsCommandMode(false);
        setCommandFeedback('');
      }, 3000);
    }
  }, [transcript, isCommandMode, processCommand]);

  // Start listening for commands
  const handleStartCommandMode = async () => {
    setIsCommandMode(true);
    setCommandFeedback('Listening for commands...');
    await startListening(true); // Enable cultural vocabulary support for better command recognition
  };

  // Stop listening for commands
  const handleStopCommandMode = () => {
    stopListening();
    setIsCommandMode(false);
    setCommandFeedback('');
  };

  if (!isVisible) return null;

  return (
    <div className="voice-command-handler fixed bottom-20 right-4 z-50">
      {/* Command Button */}
      {!isCommandMode ? (
        <button
          onClick={handleStartCommandMode}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
          aria-label="Start voice command"
          title="Start voice command"
        >
          <MicrophoneIcon className="w-6 h-6" />
        </button>
      ) : (
        <button
          onClick={handleStopCommandMode}
          className={`flex items-center justify-center w-12 h-12 rounded-full bg-red-600 text-white shadow-lg hover:bg-red-700 transition-colors ${
            isListening ? 'animate-pulse' : ''
          }`}
          aria-label="Stop voice command"
          title="Stop voice command"
        >
          <StopIcon className="w-6 h-6" />
        </button>
      )}
      
      {/* Feedback Toast */}
      {commandFeedback && (
        <div className="absolute bottom-16 right-0 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg min-w-[200px] max-w-[300px] text-sm">
          {commandFeedback}
        </div>
      )}
    </div>
  );
};

export default VoiceCommandHandler;
