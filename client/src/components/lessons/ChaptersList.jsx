import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaBook, FaCheck, FaLock, FaChevronRight } from 'react-icons/fa';

const ChaptersList = ({ chapters, topicName, subjectName }) => {
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [completedSections, setCompletedSections] = useState({});

  // If no chapters are provided, create a default structure
  const defaultChapters = [
    {
      id: 'intro',
      title: 'Introduction',
      description: `Basic introduction to ${topicName}`,
      sections: [
        { id: 'intro-1', title: 'What is ' + topicName, completed: false },
        { id: 'intro-2', title: 'Key Concepts', completed: false },
        { id: 'intro-3', title: 'Historical Context', completed: false }
      ],
      progress: 0
    },
    {
      id: 'fundamentals',
      title: 'Fundamentals',
      description: `Core principles of ${topicName}`,
      sections: [
        { id: 'fund-1', title: 'Basic Principles', completed: false },
        { id: 'fund-2', title: 'Common Applications', completed: false },
        { id: 'fund-3', title: 'Problem Solving Techniques', completed: false }
      ],
      progress: 0,
      locked: true
    },
    {
      id: 'advanced',
      title: 'Advanced Topics',
      description: `In-depth exploration of ${topicName}`,
      sections: [
        { id: 'adv-1', title: 'Complex Scenarios', completed: false },
        { id: 'adv-2', title: 'Case Studies', completed: false },
        { id: 'adv-3', title: 'Current Research', completed: false }
      ],
      progress: 0,
      locked: true
    }
  ];

  const displayChapters = chapters.length > 0 ? chapters : defaultChapters;

  // Toggle chapter expansion
  const toggleChapter = (chapterId) => {
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  // Toggle section completion
  const toggleSectionCompletion = (chapterId, sectionId) => {
    setCompletedSections(prev => {
      const key = `${chapterId}-${sectionId}`;
      const newCompletedSections = { ...prev };
      newCompletedSections[key] = !prev[key];
      return newCompletedSections;
    });
  };

  // Calculate chapter progress
  const getChapterProgress = (chapter) => {
    if (!chapter.sections || chapter.sections.length === 0) return 0;
    
    const totalSections = chapter.sections.length;
    let completedCount = 0;
    
    chapter.sections.forEach(section => {
      const key = `${chapter.id}-${section.id}`;
      if (completedSections[key]) {
        completedCount++;
      }
    });
    
    return Math.round((completedCount / totalSections) * 100);
  };

  return (
    <div className="chapters-list">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <FaBook className="mr-2 text-primary-600 dark:text-primary-400" />
          {topicName} Learning Path
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Complete these chapters to master {topicName} in {subjectName}.
        </p>
      </div>

      <div className="space-y-4">
        {displayChapters.map((chapter) => {
          const progress = chapter.progress || getChapterProgress(chapter);
          const isLocked = chapter.locked && progress < 100;
          
          return (
            <div 
              key={chapter.id}
              className={`border rounded-lg overflow-hidden ${
                isLocked 
                  ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50' 
                  : 'border-primary-200 dark:border-primary-900 bg-white dark:bg-gray-800'
              }`}
            >
              {/* Chapter header */}
              <div 
                className={`p-4 cursor-pointer ${
                  isLocked 
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-750' 
                    : 'hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}
                onClick={() => !isLocked && toggleChapter(chapter.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {isLocked ? (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-3">
                        <FaLock className="text-gray-500 dark:text-gray-400" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        progress === 100 
                          ? 'bg-green-500 text-white' 
                          : 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      }`}>
                        {progress === 100 ? <FaCheck /> : <span>{progress}%</span>}
                      </div>
                    )}
                    <div>
                      <h3 className={`font-medium ${
                        isLocked 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {chapter.description}
                      </p>
                    </div>
                  </div>
                  
                  {!isLocked && (
                    <FaChevronRight className={`transition-transform ${
                      expandedChapter === chapter.id ? 'transform rotate-90' : ''
                    } text-gray-400`} />
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${
                      progress === 100 
                        ? 'bg-green-500' 
                        : 'bg-primary-500 dark:bg-primary-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Chapter sections */}
              {!isLocked && expandedChapter === chapter.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                  {chapter.sections.map((section) => {
                    const sectionKey = `${chapter.id}-${section.id}`;
                    const isCompleted = completedSections[sectionKey];
                    
                    return (
                      <div 
                        key={section.id}
                        className="p-3 pl-16 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-750"
                      >
                        <span className={`${
                          isCompleted 
                            ? 'text-gray-500 dark:text-gray-400 line-through' 
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {section.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionCompletion(chapter.id, section.id);
                          }}
                          className={`w-6 h-6 rounded-full border ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-300 dark:border-gray-600'
                          } flex items-center justify-center`}
                        >
                          {isCompleted && <FaCheck className="text-xs" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Locked message */}
              {isLocked && (
                <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  Complete previous chapters to unlock
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

ChaptersList.propTypes = {
  chapters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      sections: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          title: PropTypes.string.isRequired,
          completed: PropTypes.bool
        })
      ),
      progress: PropTypes.number,
      locked: PropTypes.bool
    })
  ),
  topicName: PropTypes.string.isRequired,
  subjectName: PropTypes.string
};

ChaptersList.defaultProps = {
  chapters: [],
  subjectName: 'this subject'
};

export default ChaptersList;
