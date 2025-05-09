import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaChevronLeft, FaChevronRight, FaHighlighter } from 'react-icons/fa';
import { FaRegStickyNote } from 'react-icons/fa';
import { TEXT, BACKGROUNDS, BORDERS } from '../../styles/theme';

const LessonContent = ({ lesson }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [userNotes, setUserNotes] = useState({});
  const [highlightedText, setHighlightedText] = useState({});
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [currentNoteSection, setCurrentNoteSection] = useState(null);

  // Handle navigation between sections
  const goToNextSection = () => {
    if (activeSection < lesson.sections.length - 1) {
      setActiveSection(activeSection + 1);
    }
  };

  const goToPrevSection = () => {
    if (activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  // Handle text highlighting
  const handleTextHighlight = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      const sectionId = `section-${activeSection}`;
      const newHighlights = { ...highlightedText };
      
      if (!newHighlights[sectionId]) {
        newHighlights[sectionId] = [];
      }
      
      // Simple implementation - in a real app, you'd want to store range information
      newHighlights[sectionId].push(selectedText);
      setHighlightedText(newHighlights);
      
      // Clear selection
      selection.removeAllRanges();
    }
  };

  // Handle notes
  const handleAddNote = () => {
    if (noteInput.trim()) {
      const sectionId = `section-${activeSection}`;
      const newNotes = { ...userNotes };
      
      if (!newNotes[sectionId]) {
        newNotes[sectionId] = [];
      }
      
      newNotes[sectionId].push({
        id: Date.now(),
        text: noteInput,
        timestamp: new Date().toISOString()
      });
      
      setUserNotes(newNotes);
      setNoteInput('');
      setShowNotesPanel(false);
    }
  };

  // Format content based on type
  const renderContent = (content) => {
    if (Array.isArray(content)) {
      return content.map((paragraph, idx) => (
        <p key={idx} className="mb-4">{paragraph}</p>
      ));
    } else {
      return <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }} />;
    }
  };

  // Get current section
  const currentSection = lesson.sections[activeSection];
  const sectionId = `section-${activeSection}`;
  const sectionNotes = userNotes[sectionId] || [];
  const sectionHighlights = highlightedText[sectionId] || [];

  return (
    <div className="lesson-content">
      {/* Section title and navigation */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">{currentSection.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={goToPrevSection}
            disabled={activeSection === 0}
            className={`p-2 rounded-full ${
              activeSection === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-gray-700'
            }`}
            aria-label="Previous section"
          >
            <FaChevronLeft />
          </button>
          <span className="flex items-center px-2 text-sm text-gray-600 dark:text-gray-300">
            {activeSection + 1} / {lesson.sections.length}
          </span>
          <button
            onClick={goToNextSection}
            disabled={activeSection === lesson.sections.length - 1}
            className={`p-2 rounded-full ${
              activeSection === lesson.sections.length - 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-gray-700'
            }`}
            aria-label="Next section"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Content tools */}
      <div className="flex justify-end mb-4 space-x-2">
        <button
          onClick={handleTextHighlight}
          className="p-2 rounded-md text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-gray-700 flex items-center text-sm"
        >
          <FaHighlighter className="mr-1" />
          <span className="hidden sm:inline">Highlight</span>
        </button>
        <button
          onClick={() => {
            setCurrentNoteSection(activeSection);
            setShowNotesPanel(true);
          }}
          className="p-2 rounded-md text-primary-600 hover:bg-primary-100 dark:text-primary-400 dark:hover:bg-gray-700 flex items-center text-sm"
        >
          <FaRegStickyNote className="mr-1" />
          <span className="hidden sm:inline">Add Note</span>
        </button>
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-gray-700">
        <div className="prose dark:prose-invert max-w-none">
          {renderContent(currentSection.content)}
        </div>
      </div>

      {/* Section navigation */}
      <div className="flex justify-between mt-6">
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeSection > 0 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' 
              : 'invisible'
          }`}
          onClick={goToPrevSection}
          disabled={activeSection === 0}
        >
          Previous Section
        </button>
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeSection < lesson.sections.length - 1
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'invisible'
          }`}
          onClick={goToNextSection}
          disabled={activeSection === lesson.sections.length - 1}
        >
          Next Section
        </button>
      </div>

      {/* Highlights and notes */}
      {(sectionHighlights.length > 0 || sectionNotes.length > 0) && (
        <div className="mt-8 border-t pt-4 border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium mb-2">Your Study Materials</h4>
          
          {/* Highlights */}
          {sectionHighlights.length > 0 && (
            <div className="mb-4">
              <h5 className="text-md font-medium text-yellow-600 dark:text-yellow-400 flex items-center mb-2">
                <FaHighlighter className="mr-2" /> Highlights
              </h5>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md">
                {sectionHighlights.map((highlight, idx) => (
                  <div key={idx} className="mb-2 last:mb-0 text-gray-800 dark:text-gray-200">
                    "{highlight}"
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Notes */}
          {sectionNotes.length > 0 && (
            <div>
              <h5 className="text-md font-medium text-blue-600 dark:text-blue-400 flex items-center mb-2">
                <FaRegStickyNote className="mr-2" /> Notes
              </h5>
              <div className="space-y-2">
                {sectionNotes.map(note => (
                  <div 
                    key={note.id} 
                    className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-gray-800 dark:text-gray-200"
                  >
                    {note.text}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(note.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes panel */}
      {showNotesPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full">
            <h3 className="text-lg font-medium mb-2">Add Note</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              For section: {lesson.sections[currentNoteSection].title}
            </p>
            <textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Write your note here..."
              className="w-full p-2 border rounded-md mb-4 h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNotesPanel(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

LessonContent.propTypes = {
  lesson: PropTypes.shape({
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    sections: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        content: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.arrayOf(PropTypes.string)
        ]).isRequired
      })
    ).isRequired
  }).isRequired
};

export default LessonContent;
