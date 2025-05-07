import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubject } from "../contexts/SubjectContext";
import { useAppearance } from "../context/AppearanceContext";
import { useNavigate, Link } from "react-router-dom";
import ThemeToggle from "../components/ui/ThemeToggle";
import {
  MicrophoneIcon,
  UserIcon,
  KeyIcon,
  MoonIcon,
  SunIcon,
  BellIcon,
  CogIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { user } = useAuth();
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  const { appearanceSettings, updateAppearanceSettings, isLoading: isAppearanceLoading } = useAppearance();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    app: true,
    studyReminders: true,
    newFeatures: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Load user preferences when component mounts
  useEffect(() => {
    if (user && user.preferences) {
      // Load notification preferences
      if (user.preferences.notifications) {
        setNotifications({
          email: user.preferences.notifications.email ?? true,
          app: user.preferences.notifications.app ?? true,
          studyReminders: user.preferences.notifications.studyReminders ?? true,
          newFeatures: user.preferences.notifications.newFeatures ?? false,
        });
      }
    }
  }, [user]);

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotifications(prev => ({ ...prev, [name]: checked }));
  };

  const handleAccessibilityChange = async (e) => {
    const { name, checked } = e.target;
    try {
      await updateAppearanceSettings({ [name]: checked });
    } catch (error) {
      setMessage({
        text: `Failed to update ${name} setting. Please try again.`,
        type: "error"
      });
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // Update user preferences with notification settings
      if (user && user.id) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            userData.preferences = { 
              ...userData.preferences,
              notifications: notifications
            };
            localStorage.setItem("user", JSON.stringify(userData));

            setMessage({ 
              text: "Settings saved successfully!", 
              type: "success" 
            });
          } catch (err) {
            console.error("Failed to update notification preferences in local storage:", err);
            throw new Error("Failed to save settings");
          }
        }
      }
    } catch (error) {
      setMessage({ 
        text: "Failed to save settings. Please try again.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Settings</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === "success" 
            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Account Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Account</h2>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Email</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || "No email set"}</p>
            </div>
            <button 
              onClick={() => navigate("/profile")}
              className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
            >
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Password</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Last changed: Never</p>
            </div>
            <button 
              onClick={() => navigate("/change-password")}
              className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
            >
              Change
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Default Subject</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Used when you first log in</p>
            </div>
            <select
              value={selectedSubject.name}
              onChange={(e) => setSelectedSubject(subjects.find(s => s.name === e.target.value))}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {subjects.map(subject => (
                <option key={subject.name} value={subject.name} className="dark:bg-gray-700 dark:text-gray-200">
                  {subject.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Appearance Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Appearance</h2>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
            </div>
            <ThemeToggle />
          </div>
          
          <div className="py-3">
            <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Accessibility</h3>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="highContrast"
                  checked={appearanceSettings.highContrast}
                  onChange={handleAccessibilityChange}
                  disabled={isAppearanceLoading}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">High contrast mode</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="largeText"
                  checked={appearanceSettings.largeText}
                  onChange={handleAccessibilityChange}
                  disabled={isAppearanceLoading}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Larger text</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="reduceMotion"
                  checked={appearanceSettings.reduceMotion}
                  onChange={handleAccessibilityChange}
                  disabled={isAppearanceLoading}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-gray-700 dark:text-gray-300">Reduce motion</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Voice Settings Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Voice Interaction</h2>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Voice Settings</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Configure voice commands, cultural vocabulary support, and more</p>
            </div>
            <Link 
              to="/voice-settings"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors flex items-center"
            >
              <MicrophoneIcon className="w-5 h-5 mr-2" />
              Configure
            </Link>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <p>Access voice-enabled features:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><Link to="/voice-flashcards" className="text-primary-600 hover:underline">Voice Flashcards</Link></li>
              <li><Link to="/voice-exam" className="text-primary-600 hover:underline">Voice Exam Simulation</Link></li>
              <li><Link to="/voice-demo" className="text-primary-600 hover:underline">Voice Demo</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Notifications Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Notifications</h2>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Email notifications</span>
              <input
                type="checkbox"
                name="email"
                checked={notifications.email}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">App notifications</span>
              <input
                type="checkbox"
                name="app"
                checked={notifications.app}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-700 dark:text-gray-300">Study reminders</span>
              <input
                type="checkbox"
                name="studyReminders"
                checked={notifications.studyReminders}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </label>
            
            <label className="flex items-center justify-between py-2">
              <span className="text-gray-700 dark:text-gray-300">New features and updates</span>
              <input
                type="checkbox"
                name="newFeatures"
                checked={notifications.newFeatures}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </label>
          </div>
        </div>
        
        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isLoading || isAppearanceLoading}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
