import React, { useState, useEffect } from 'react';
import { useSubject } from '../contexts/SubjectContext';
import VoiceFlashcard from '../components/voice/VoiceFlashcard';
import { useVoice } from '../context/VoiceContext';

const VoiceFlashcardPage = () => {
  const { selectedSubject } = useSubject();
  const { isSpeechRecognitionSupported } = useVoice();
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });
  const [culturalVocabularyMode, setCulturalVocabularyMode] = useState(false);
  const [culturalVocabularyType, setCulturalVocabularyType] = useState('standard');

  // Generate flashcards based on the selected subject
  useEffect(() => {
    if (selectedSubject) {
      generateFlashcards();
    }
  }, [selectedSubject]);

  // Generate flashcards from the selected subject's topics
  const generateFlashcards = () => {
    const cards = [];
    
    // Get all topics from the selected subject
    const topics = selectedSubject.groups.flatMap(group => group.topics);
    
    // Generate 10 flashcards (or fewer if there aren't enough topics)
    const numCards = Math.min(10, topics.length);
    
    // Shuffle topics and select a subset
    const shuffledTopics = [...topics].sort(() => Math.random() - 0.5).slice(0, numCards);
    
    // Create flashcards from the selected topics
    shuffledTopics.forEach(topic => {
      cards.push({
        id: Math.random().toString(36).substring(2, 9),
        question: `What is ${topic}?`,
        answer: generateAnswer(topic),
      });
    });
    
    setFlashcards(cards);
    setCurrentCardIndex(0);
    setStats({ correct: 0, incorrect: 0, total: 0 });
  };
  
  // Generate a simple answer for a topic (in a real app, this would come from a database)
  const generateAnswer = (topic) => {
    // This is a simplified example - in a real app, these would be actual definitions
    return `${topic} is an important concept in ${selectedSubject.name} that involves understanding key principles and applications.`;
  };
  
  // Handle moving to the next card
  const handleNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      // End of deck
      alert('You have completed all flashcards!');
      // Restart with new cards
      generateFlashcards();
    }
  };
  
  // Handle correct answer
  const handleCorrect = () => {
    setStats(prev => ({
      ...prev,
      correct: prev.correct + 1,
      total: prev.total + 1
    }));
  };
  
  // Handle incorrect answer
  const handleIncorrect = () => {
    setStats(prev => ({
      ...prev,
      incorrect: prev.incorrect + 1,
      total: prev.total + 1
    }));
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
      <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">Voice Flashcards</h1>
      
      {!isSpeechRecognitionSupported() ? (
        <div className="card p-6 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200">
          <h2 className="text-lg font-semibold mb-2">Speech Recognition Not Supported</h2>
          <p>Your browser does not support speech recognition. Please try using a modern browser like Chrome, Edge, or Safari.</p>
        </div>
      ) : (
        <>
          {/* Controls and Stats */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <button 
                className="btn-primary"
                onClick={generateFlashcards}
              >
                New Flashcards
              </button>
              <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                Card {currentCardIndex + 1} of {flashcards.length}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">
                Correct: {stats.correct}
              </span>
              <span className="text-red-600 dark:text-red-400">
                Incorrect: {stats.incorrect}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                Accuracy: {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
          
          {/* Cultural Vocabulary Settings */}
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="culturalVocabularyMode"
                  checked={culturalVocabularyMode}
                  onChange={(e) => setCulturalVocabularyMode(e.target.checked)}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="culturalVocabularyMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enable Cultural Vocabulary Support
                </label>
              </div>
              
              {culturalVocabularyMode && (
                <div className="flex-1">
                  <select
                    value={culturalVocabularyType}
                    onChange={(e) => setCulturalVocabularyType(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {culturalVocabularyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {culturalVocabularyMode && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                <p>Cultural vocabulary support helps improve recognition of diverse speech patterns and dialectal variations.</p>
              </div>
            )}
          </div>
          
          {/* Flashcard */}
          {flashcards.length > 0 && (
            <VoiceFlashcard
              question={flashcards[currentCardIndex].question}
              answer={flashcards[currentCardIndex].answer}
              onNext={handleNextCard}
              onCorrect={handleCorrect}
              onIncorrect={handleIncorrect}
              culturalVocabularyMode={culturalVocabularyMode}
            />
          )}
          
          {flashcards.length === 0 && (
            <div className="card p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">No flashcards available. Please select a subject.</p>
            </div>
          )}
        </>
      )}
      
      {/* Instructions */}
      <div className="mt-8 card p-6">
        <h2 className="text-lg font-semibold mb-2">How to Use Voice Flashcards</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
          <li>The question will be read aloud automatically.</li>
          <li>Click the "Speak Answer" button and say your answer clearly.</li>
          <li>Your answer will be evaluated and feedback will be provided.</li>
          <li>Click "Next Card" to continue to the next flashcard.</li>
          <li>Enable Cultural Vocabulary Support if you have a specific dialect or accent.</li>
        </ol>
      </div>
    </div>
  );
};

export default VoiceFlashcardPage;
