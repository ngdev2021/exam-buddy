import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ChangePasswordPage() {
  const { user, token, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setMessage({ text: "", type: "" });
    
    try {
      await updatePassword(formData.currentPassword, formData.newPassword);
      
      setMessage({
        text: "Password changed successfully!",
        type: "success"
      });
      
      // Clear form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/settings");
      }, 2000);
    } catch (error) {
      setMessage({
        text: error.message || "Failed to change password. Please try again.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Change Password</h1>
      
      {message.text && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === "success" 
            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" 
            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                errors.currentPassword ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                errors.newPassword ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 ${
                errors.confirmPassword ? "border-red-500 dark:border-red-400" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
            )}
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? "Changing..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
