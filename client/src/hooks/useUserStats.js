import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { handleApiResponse } from '../utils/apiUtils';

/**
 * Hook for fetching and managing user statistics
 */
export function useUserStats() {
  const { token, handleAuthError } = useAuth();
  const queryClient = useQueryClient();
  
  // Query key for user stats
  const statsQueryKey = ['userStats'];
  
  // Fetch user stats
  const { 
    data: stats, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: statsQueryKey,
    queryFn: async () => {
      if (!token) return null;
      
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-stats`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Check for auth errors
        if (response.status === 401 || response.status === 403) {
          handleAuthError(response.status);
          return null;
        }
        
        return await handleApiResponse(response, 'Failed to fetch user statistics');
      } catch (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }
    },
    enabled: !!token, // Only run query if token exists
  });
  
  // Update user stats
  const updateStatsMutation = useMutation({
    mutationFn: async (newStats) => {
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newStats)
      });
      
      return await handleApiResponse(response, 'Failed to update user statistics');
    },
    onSuccess: () => {
      // Invalidate and refetch the stats query
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
    }
  });
  
  // Helper function to update stats after completing a question
  const updateAfterQuestion = (topic, isCorrect) => {
    if (!stats) return;
    
    // Create a copy of the current stats
    const updatedStats = { ...stats };
    
    // Initialize topic stats if they don't exist
    if (!updatedStats[topic]) {
      updatedStats[topic] = { total: 0, correct: 0, incorrect: 0 };
    }
    
    // Update the stats
    updatedStats[topic].total += 1;
    if (isCorrect) {
      updatedStats[topic].correct += 1;
    } else {
      updatedStats[topic].incorrect += 1;
    }
    
    // Send the update to the server
    updateStatsMutation.mutate(updatedStats);
  };
  
  return {
    stats,
    isLoading,
    error,
    refetch,
    updateAfterQuestion,
    isUpdating: updateStatsMutation.isPending
  };
}
