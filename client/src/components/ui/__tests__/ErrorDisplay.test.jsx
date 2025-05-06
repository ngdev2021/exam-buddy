import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDisplay from '../ErrorDisplay';

// Mock the import.meta.env before tests
jest.mock('../../../utils/apiUtils', () => ({
  handleApiResponse: jest.fn(),
  useApi: jest.fn().mockReturnValue({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }),
}));

describe('ErrorDisplay Component', () => {
  test('renders with string error message', () => {
    const errorMessage = 'Something went wrong with the API';
    render(<ErrorDisplay error={errorMessage} />);
    
    // Check that the error message is displayed
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });
  
  test('renders with Error object', () => {
    const errorObj = new Error('Network error occurred');
    render(<ErrorDisplay error={errorObj} />);
    
    // Check that the error message from the Error object is displayed
    expect(screen.getByText('Network error occurred')).toBeInTheDocument();
  });
  
  test('renders with custom title', () => {
    const customTitle = 'API Connection Failed';
    render(<ErrorDisplay error="Error message" title={customTitle} />);
    
    // Check that the custom title is displayed
    expect(screen.getByText(customTitle)).toBeInTheDocument();
  });
  
  test('calls onRetry when retry button is clicked', () => {
    // Create a mock function for onRetry
    const mockRetry = jest.fn();
    
    render(<ErrorDisplay error="Error message" onRetry={mockRetry} />);
    
    // Find and click the retry button
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    
    // Check that the onRetry function was called
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });
  
  test('does not show retry button when onRetry is not provided', () => {
    render(<ErrorDisplay error="Error message" />);
    
    // Check that the retry button is not in the document
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
  
  test('uses fullPage class when fullPage is true', () => {
    render(<ErrorDisplay error="Error message" fullPage />);
    
    // Check that the container has the fullPage class
    const container = screen.getByText('Error message').closest('div');
    expect(container).toHaveClass('min-h-[80vh]');
  });
});
