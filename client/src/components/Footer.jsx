import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 px-4 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <span className="font-bold text-lg text-primary-600 dark:text-primary-400">ExamBuddy</span>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Your personal study assistant
          </p>
        </div>
        
        <div className="flex flex-col items-center md:items-end">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {currentYear} ExamBuddy. All rights reserved.
          </p>
          <div className="flex mt-2 space-x-4">
            <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors">
              Help
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
