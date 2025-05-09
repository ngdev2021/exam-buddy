import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaCreditCard, FaArrowRight, FaArrowLeft, FaRedo, FaCheck, FaTimes } from 'react-icons/fa';
import { TEXT, BACKGROUNDS, BORDERS } from '../../styles/theme';

const FlashcardDeck = ({ flashcards, topicName, subjectName }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [cardHistory, setCardHistory] = useState([]);
  
  // Create default flashcards if none provided
  const defaultFlashcards = [
    {
      id: 'card-1',
      question: `What is ${topicName}?`,
      answer: `${topicName} is a key concept in ${subjectName} that involves understanding fundamental principles and applications.`
    },
    {
      id: 'card-2',
      question: `What are the main components of ${topicName}?`,
      answer: `The main components include theoretical frameworks, practical applications, and historical context.`
    },
    {
      id: 'card-3',
      question: `How is ${topicName} applied in real-world scenarios?`,
      answer: `${topicName} is applied through various methodologies including analysis, synthesis, and evaluation of relevant data and concepts.`
    },
    {
      id: 'card-4',
      question: `What are common misconceptions about ${topicName}?`,
      answer: `Common misconceptions include oversimplification, misattribution of causes and effects, and failure to consider contextual factors.`
    },
    {
      id: 'card-5',
      question: `How has ${topicName} evolved over time?`,
      answer: `${topicName} has evolved through various theoretical paradigms, influenced by research findings, technological advancements, and changing societal needs.`
    }
  ];
  
  const displayFlashcards = flashcards.length > 0 ? flashcards : defaultFlashcards;
  
  // Reset when flashcards change
  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setKnownCards({});
    setShowResults(false);
    setCardHistory([]);
  }, [flashcards, topicName]);
  
  // Handle card flip
  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Navigate to next card
  const nextCard = () => {
    if (currentCardIndex < displayFlashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // Show results when reached the end
      setShowResults(true);
    }
  };
  
  // Navigate to previous card
  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };
  
  // Mark card as known/unknown
  const markCard = (known) => {
    const currentCard = displayFlashcards[currentCardIndex];
    
    // Update known cards state
    setKnownCards(prev => ({
      ...prev,
      [currentCard.id]: known
    }));
    
    // Add to history
    setCardHistory(prev => [
      ...prev,
      {
        cardId: currentCard.id,
        known,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Move to next card
    nextCard();
  };
  
  // Restart the deck
  const restartDeck = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowResults(false);
  };
  
  // Calculate stats
  const calculateStats = () => {
    const total = displayFlashcards.length;
    const reviewed = Object.keys(knownCards).length;
    const known = Object.values(knownCards).filter(Boolean).length;
    const unknown = reviewed - known;
    
    return {
      total,
      reviewed,
      known,
      unknown,
      percentKnown: total > 0 ? Math.round((known / total) * 100) : 0,
      percentReviewed: total > 0 ? Math.round((reviewed / total) * 100) : 0
    };
  };
  
  const stats = calculateStats();
  const currentCard = displayFlashcards[currentCardIndex];
  
  // If showing results
  if (showResults) {
    return (
      <div className="flashcard-results">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Study Session Complete!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            You've reviewed all flashcards for {topicName}
          </p>
        </div>
        
        {/* Stats display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats.known}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cards Known</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {stats.unknown}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cards to Review</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow text-center">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-1">
              {stats.percentKnown}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Mastery Level</div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress</span>
            <span>{stats.percentReviewed}% Complete</span>
          </div>
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 dark:bg-primary-500"
              style={{ width: `${stats.percentReviewed}%` }}
            ></div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-center">
          <button
            onClick={restartDeck}
            className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
          >
            <FaRedo className="mr-2" />
            Study Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flashcard-deck">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <FaCreditCard className="mr-2 text-primary-600 dark:text-primary-400" />
          Flashcards: {topicName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Test your knowledge of key concepts in {topicName}.
        </p>
        
        {/* Progress indicator */}
        <div className="mt-4 flex items-center">
          <div className="flex-1">
            <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-600 dark:bg-primary-500"
                style={{ width: `${(currentCardIndex / displayFlashcards.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="ml-3 text-sm text-gray-600 dark:text-gray-400">
            {currentCardIndex + 1} / {displayFlashcards.length}
          </div>
        </div>
      </div>
      
      {/* Flashcard */}
      <div 
        className={`flashcard relative h-64 md:h-80 w-full rounded-xl shadow-lg cursor-pointer transition-all duration-500 transform ${
          isFlipped ? 'bg-primary-50 dark:bg-primary-900/20' : 'bg-white dark:bg-gray-800'
        }`}
        onClick={flipCard}
        style={{ perspective: '1000px' }}
      >
        <div 
          className={`absolute inset-0 rounded-xl p-6 flex flex-col justify-center items-center backface-visibility-hidden transition-all duration-500 ${
            isFlipped ? 'opacity-0 rotate-y-180' : 'opacity-100'
          }`}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Question:</div>
          <div className="text-xl md:text-2xl font-medium text-center">
            {currentCard.question}
          </div>
          <div className="absolute bottom-4 text-sm text-gray-400 dark:text-gray-500">
            Click to reveal answer
          </div>
        </div>
        
        <div 
          className={`absolute inset-0 rounded-xl p-6 flex flex-col justify-center items-center backface-visibility-hidden transition-all duration-500 ${
            isFlipped ? 'opacity-100' : 'opacity-0 rotate-y-180'
          }`}
        >
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">Answer:</div>
          <div className="text-lg md:text-xl text-center overflow-y-auto max-h-48">
            {currentCard.answer}
          </div>
        </div>
      </div>
      
      {/* Navigation and actions */}
      <div className="mt-6 flex flex-col md:flex-row justify-between items-center">
        <div className="flex space-x-2 mb-4 md:mb-0">
          <button
            onClick={prevCard}
            disabled={currentCardIndex === 0}
            className={`p-2 rounded-full ${
              currentCardIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            aria-label="Previous card"
          >
            <FaArrowLeft />
          </button>
          
          <button
            onClick={nextCard}
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Next card"
          >
            <FaArrowRight />
          </button>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => markCard(false)}
            className="flex items-center px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-md transition-colors"
          >
            <FaTimes className="mr-2" />
            Still Learning
          </button>
          
          <button
            onClick={() => markCard(true)}
            className="flex items-center px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-md transition-colors"
          >
            <FaCheck className="mr-2" />
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

FlashcardDeck.propTypes = {
  flashcards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired
    })
  ),
  topicName: PropTypes.string.isRequired,
  subjectName: PropTypes.string
};

FlashcardDeck.defaultProps = {
  flashcards: [],
  subjectName: 'this subject'
};

export default FlashcardDeck;
