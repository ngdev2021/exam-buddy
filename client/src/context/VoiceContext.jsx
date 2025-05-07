import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import axios from 'axios';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioStream, setAudioStream] = useState(null);
  const [error, setError] = useState(null);
  
  // References
  const recognitionRef = useRef(null);
  const audioPlayerRef = useRef(null);
  
  // Initialize speech recognition
  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    
    recognitionRef.current.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setInterimTranscript(interimTranscript);
      if (finalTranscript) {
        console.log('Final transcript received:', finalTranscript);
        // Replace multiple spaces with a single space and trim
        const cleanTranscript = finalTranscript.replace(/\s+/g, ' ').trim();
        setTranscript(prev => prev + cleanTranscript + ' ');
      }
    };
    
    recognitionRef.current.onerror = (event) => {
      console.error(`Speech recognition error: ${event.error}`);
      setError(`Speech recognition error: ${event.error}`);
      if (isListening) {
        stopListening();
      }
    };
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);
  
  // Start listening with option to use server-side processing
  const startListening = async (useServerProcessing = false) => {
    try {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      
      if (useServerProcessing) {
        // For server-side processing, we'll record audio and send it to our API
        // This is a placeholder for now - we'll implement this in the next phase
        console.log('Server-side processing not yet implemented');
        
        // For now, fall back to browser speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      } else {
        // Use browser's speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      }
    } catch (err) {
      console.error(`Microphone access error: ${err.message}`);
      setError(`Microphone access error: ${err.message}`);
    }
  };
  
  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error(`Error stopping recognition: ${err.message}`);
      }
    }
    
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop());
      setAudioStream(null);
    }
    
    setIsListening(false);
    setInterimTranscript('');
  };
  
  // Speak text using LLaMA-Omni2 via backend API
  const speak = async (text, voiceStyle = 'default') => {
    if (isSpeaking) {
      stopSpeaking();
    }
    
    // Check if we're using mock auth - declare at the top level of the function
    const isMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';
    
    try {
      setIsSpeaking(true);
      setError(null);
      
      if (isMockAuth) {
        // In mock auth mode, use browser's speech synthesis directly
        console.log('Using browser speech synthesis in mock auth mode');
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Get user preferences from localStorage if available
        const voicePrefs = JSON.parse(localStorage.getItem('voicePreferences') || '{}');
        const voiceRate = voicePrefs.rate || 1.0; // Default rate is 1.0
        const voicePitch = voicePrefs.pitch || 1.0; // Default pitch is 1.0
        const culturalStyle = voicePrefs.culturalStyle || 'standard'; // Default is standard
        
        // Apply rate and pitch settings
        utterance.rate = voiceRate;
        utterance.pitch = voicePitch;
        
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        
        // Set default to Google UK English Female if available
        let defaultVoice = voices.find(v => v.name === 'Google UK English Female');
        // If not found, try Google US English Female
        if (!defaultVoice) {
          defaultVoice = voices.find(v => v.name === 'Google US English Female');
        }
        // If still not found, try any female voice
        if (!defaultVoice) {
          defaultVoice = voices.find(v => v.name.includes('female') || v.name.includes('Female'));
        }
        
        // Apply voice style if specified, otherwise use default
        if (voiceStyle !== 'default' && voices.length > 0) {
          // Enhanced mapping of styles to voice types
          switch(voiceStyle) {
            case 'female':
              utterance.voice = voices.find(v => v.name.includes('female') || v.name.includes('Female')) || defaultVoice;
              break;
            case 'male':
              utterance.voice = voices.find(v => v.name.includes('male') || v.name.includes('Male'));
              break;
            case 'british':
              utterance.voice = voices.find(v => v.name.includes('British') || v.name.includes('UK'));
              break;
            case 'australian':
              utterance.voice = voices.find(v => v.name.includes('Australian') || v.name.includes('AU'));
              break;
            case 'indian':
              utterance.voice = voices.find(v => v.name.includes('Indian'));
              break;
            default:
              // Try to find a voice that matches the style name
              utterance.voice = voices.find(v => v.name.toLowerCase().includes(voiceStyle.toLowerCase()));
          }
        } else if (defaultVoice) {
          // Use our default Google female voice
          utterance.voice = defaultVoice;
        }
        
        // If no specific voice found, fall back to default
        if (!utterance.voice && defaultVoice) {
          console.log(`No voice found for style: ${voiceStyle}, using default Google female voice`);
          utterance.voice = defaultVoice;
        }
        
        // Log the voice being used
        console.log(`Using voice: ${utterance.voice ? utterance.voice.name : 'default'} with rate: ${utterance.rate} and pitch: ${utterance.pitch}`);
        
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        return;
      }
      
      // Get the auth token for non-mock mode
      const token = localStorage.getItem('token');
      
      // Call our backend API
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/voice/generate${isMockAuth ? '?mockAuth=true' : ''}`,
        { text, voiceStyle, mockAuth: isMockAuth },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Mock-Auth': isMockAuth ? 'true' : 'false'
          }
        }
      );
      
      if (response.data.audioUrl) {
        // Create and play audio
        const audio = new Audio(`${import.meta.env.VITE_API_URL}${response.data.audioUrl}`);
        audio.onended = () => setIsSpeaking(false);
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setError('Error playing audio');
          setIsSpeaking(false);
        };
        
        await audio.play();
      } else {
        // Fallback to browser's speech synthesis if API fails
        console.warn('Using fallback speech synthesis');
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
        
        utterance.onend = () => setIsSpeaking(false);
      }
    } catch (err) {
      console.error(`Speech synthesis error: ${err.message}`);
      setError(`Speech synthesis error: ${err.message}`);
      setIsSpeaking(false);
      
      // Fallback to browser's speech synthesis
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
        utterance.onend = () => setIsSpeaking(false);
      } catch (fallbackErr) {
        console.error(`Fallback speech synthesis error: ${fallbackErr.message}`);
      }
    }
  };
  
  // Stop speaking
  const stopSpeaking = () => {
    // Cancel browser speech synthesis
    window.speechSynthesis.cancel();
    
    // Stop any playing audio elements
    document.querySelectorAll('audio').forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    setIsSpeaking(false);
  };
  
  // Check if browser supports speech recognition
  const isSpeechRecognitionSupported = () => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  };
  
  return (
    <VoiceContext.Provider
      value={{
        isListening,
        isSpeaking,
        transcript,
        interimTranscript,
        audioStream,
        error,
        startListening,
        stopListening,
        speak,
        stopSpeaking,
        isSpeechRecognitionSupported
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);

export default VoiceContext;
