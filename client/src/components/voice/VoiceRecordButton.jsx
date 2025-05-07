import React from 'react';
import { useVoice } from '../../context/VoiceContext';

const VoiceRecordButton = ({ className = '', size = 'md', onTranscriptReady }) => {
  const { 
    isListening, 
    isSpeaking,
    transcript, 
    startListening, 
    stopListening,
    error,
    isSpeechRecognitionSupported
  } = useVoice();

  const handleToggleListening = async () => {
    if (isListening) {
      stopListening();
      if (onTranscriptReady && transcript) {
        onTranscriptReady(transcript);
      }
    } else {
      await startListening();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  // If speech recognition is not supported, show a disabled button
  if (!isSpeechRecognitionSupported()) {
    return (
      <button
        className={`rounded-full bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed flex items-center justify-center ${sizeClasses[size]} ${className}`}
        disabled
        title="Voice input not supported in this browser"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.5a6.5 6.5 0 006.5-6.5m-13 0a6.5 6.5 0 0113 0m-13 0v-3a6.5 6.5 0 0113 0v3m-13 0h13" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 19L5 5" />
        </svg>
      </button>
    );
  }

  return (
    <button
      className={`rounded-full ${isListening 
        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
        : 'bg-primary-500 hover:bg-primary-600 text-white'
      } flex items-center justify-center shadow-md transition-all ${sizeClasses[size]} ${className} ${
        error ? 'border-2 border-red-500' : ''
      }`}
      onClick={handleToggleListening}
      disabled={isSpeaking}
      title={isListening ? 'Stop recording' : 'Start recording'}
    >
      {isListening ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="6" y="6" width="12" height="12" strokeWidth={2} />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
};

export default VoiceRecordButton;
