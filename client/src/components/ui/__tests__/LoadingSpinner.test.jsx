import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

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

describe('LoadingSpinner Component', () => {
  test('renders with default props', () => {
    render(<LoadingSpinner />);
    
    // Check that the spinner element exists with the correct role
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toBeInTheDocument();
    
    // Check that it has the medium size class by default
    expect(spinnerElement).toHaveClass('w-8 h-8');
  });
  
  test('renders with small size', () => {
    render(<LoadingSpinner size="small" />);
    
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toHaveClass('w-4 h-4');
  });
  
  test('renders with large size', () => {
    render(<LoadingSpinner size="large" />);
    
    const spinnerElement = screen.getByRole('status');
    expect(spinnerElement).toHaveClass('w-12 h-12');
  });
  
  test('displays text when provided', () => {
    const testText = 'Loading your data...';
    render(<LoadingSpinner text={testText} />);
    
    // Check that the text is displayed
    expect(screen.getByText(testText)).toBeInTheDocument();
  });
  
  test('uses fullPage class when fullPage is true', () => {
    render(<LoadingSpinner fullPage />);
    
    // Check that the container has the fullPage class
    const container = screen.getByRole('status').parentElement;
    expect(container).toHaveClass('min-h-[80vh]');
  });
});
