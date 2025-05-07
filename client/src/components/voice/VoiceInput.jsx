import React from 'react';
import { useVoice } from '../../context/VoiceContext';
import VoiceRecordButton from './VoiceRecordButton';
import VoiceWaveform from './VoiceWaveform';

const VoiceInput = ({ 
  onTranscriptReady, 
  placeholder = 'Press the microphone button and speak...',
  className = ''
}) => {
  const { 
    isListening, 
    transcript, 
    interimTranscript,
    audioStream,
    error
  } = useVoice();

  return (
    <div className={`voice-input-container ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        <VoiceRecordButton onTranscriptReady={onTranscriptReady} />
        
        <div className="flex-1">
          {(transcript || interimTranscript) ? (
            <div className="text-sm font-medium">
              <span className="text-gray-800 dark:text-gray-200">{transcript}</span>
              <span className="text-gray-500 dark:text-gray-400">{interimTranscript}</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {placeholder}
            </div>
          )}
        </div>
      </div>
      
      {isListening && (
        <VoiceWaveform isRecording={isListening} audioStream={audioStream} />
      )}
      
      {error && (
        <div className="text-sm text-red-500 mt-1">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
