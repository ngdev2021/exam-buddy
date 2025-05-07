import React, { useState } from 'react';
import { useVoice } from '../../context/VoiceContext';

const VoiceOutput = ({ 
  text, 
  autoPlay = false, 
  voiceStyle = 'default',
  className = ''
}) => {
  const { isSpeaking, speak, stopSpeaking } = useVoice();
  const [hasPlayed, setHasPlayed] = useState(autoPlay);

  // Track the text to detect changes
  const [lastSpokenText, setLastSpokenText] = useState('');
  
  // Use a ref to track the component's mounted state
  const isMountedRef = React.useRef(false);
  
  // Play speech when component mounts if autoPlay is true, but only once
  React.useEffect(() => {
    // Skip on first render if we've already played this text
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      
      // Only auto-play if:
      // 1. autoPlay is true
      // 2. We have text to speak
      // 3. We haven't played this text before
      if (autoPlay && text && !hasPlayed) {
        console.log('AutoPlay speaking (once):', text);
        speak(text, voiceStyle);
        setHasPlayed(true);
        setLastSpokenText(text);
      }
    }
    
    // Cleanup function to stop speaking when component unmounts
    return () => {
      if (isSpeaking) {
        stopSpeaking();
      }
    };
  }, []);  // Empty dependency array - only run on mount and unmount
  
  // Handle text changes separately
  React.useEffect(() => {
    // Reset hasPlayed when text changes
    if (text !== lastSpokenText) {
      setHasPlayed(false);
    }
  }, [text, lastSpokenText]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (text) {
      speak(text, voiceStyle);
    }
  };

  return (
    <div className={`voice-output-container ${className}`}>
      <button
        onClick={handleSpeak}
        disabled={!text}
        className={`inline-flex items-center justify-center p-2 rounded-full ${
          isSpeaking 
            ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' 
            : text 
              ? 'bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600'
        } transition-colors`}
        title={isSpeaking ? 'Stop speaking' : 'Speak text'}
      >
        {isSpeaking ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1V10a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceOutput;
