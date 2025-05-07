import React, { useState } from 'react';
import { useVoice } from '../context/VoiceContext';
import VoiceInput from '../components/voice/VoiceInput';
import VoiceOutput from '../components/voice/VoiceOutput';

const VoiceDemoPage = () => {
  const [userInput, setUserInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleTranscriptReady = (transcript) => {
    setUserInput(transcript);
    processVoiceInput(transcript);
  };
  
  const processVoiceInput = async (input) => {
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call the LLaMA-Omni2 model
      // For now, we'll just simulate a response
      const response = await simulateAIResponse(input);
      setAiResponse(response);
    } catch (error) {
      console.error('Error processing voice input:', error);
      setAiResponse('Sorry, I encountered an error processing your request.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const simulateAIResponse = async (input) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple response logic for demo
    const inputLower = input.toLowerCase();
    
    if (inputLower.includes('hello') || inputLower.includes('hi')) {
      return 'Hello! How can I help you with your exam preparation today?';
    } else if (inputLower.includes('help')) {
      return 'I can help you practice for exams, create flashcards, or answer questions about your study topics.';
    } else if (inputLower.includes('flashcard') || inputLower.includes('flash card')) {
      return 'I can create flashcards for you. Just tell me what topic you want to study.';
    } else if (inputLower.includes('question')) {
      return 'I can generate practice questions for you. What subject are you studying?';
    } else {
      return `I heard you say: "${input}". How can I help you with that?`;
    }
  };
  
  return (
    <div className="container-layout pb-20">
      <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">Voice Interaction Demo</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">How it works</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          This demo showcases the voice interaction capabilities we're building for Exam Buddy.
          Click the microphone button, speak, and see the AI response. You can also hear the
          response spoken back to you.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md text-yellow-800 dark:text-yellow-200 text-sm">
          <p><strong>Note:</strong> This is using the browser's built-in speech recognition and synthesis.
          The final implementation will use LLaMA-Omni2 for more natural voice interactions.</p>
        </div>
      </div>
      
      <div className="card p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Your Voice Input</h2>
        <VoiceInput 
          onTranscriptReady={handleTranscriptReady} 
          placeholder="Click the microphone and ask a question..."
          className="mb-4"
        />
        
        {userInput && (
          <div className="mt-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Transcript:</h3>
            <p className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">{userInput}</p>
          </div>
        )}
      </div>
      
      {(isProcessing || aiResponse) && (
        <div className="card p-4">
          <h2 className="text-lg font-semibold mb-3">AI Response</h2>
          
          {isProcessing ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <VoiceOutput text={aiResponse} autoPlay={true} />
              <div className="flex-1 p-3 bg-primary-50 dark:bg-primary-900/30 rounded-md">
                {aiResponse}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
        <h2 className="text-lg font-semibold mb-3">Try These Examples</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>"Hello, can you help me study?"</li>
          <li>"Create a flashcard about insurance policies"</li>
          <li>"Generate a practice question"</li>
          <li>"What topics can you help with?"</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceDemoPage;
