import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { mockAuthService } from '../utils/mockAuthService';
import { handleApiResponse } from '../utils/apiUtils';

/**
 * Hook for fetching and managing dashboard statistics
 */
export function useDashboardStats() {
  const { token, handleAuthError } = useAuth();
  const queryClient = useQueryClient();
  
  // Query key for dashboard stats
  const statsQueryKey = ['dashboardStats'];
  
  // Fetch dashboard stats
  const fetchStats = async () => {
    if (!token) {
      throw new Error('Authentication required');
    }

    // Use mock service when VITE_USE_MOCK_AUTH is true (in both dev and prod)
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      console.log('Using mock stats service');
      const data = await mockAuthService.getUserStats();
      return data;
    }

    // Production stats fetch
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  };
  
  const { 
    data: stats = {}, 
    isLoading, 
    error,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: statsQueryKey,
    queryFn: fetchStats,
    enabled: !!token, // Only run query if token exists
  });
  
  // Reset stats mutation
  const resetUserStats = async () => {
    if (!token) {
      throw new Error('Authentication required');
    }

    // Use mock service when VITE_USE_MOCK_AUTH is true (in both dev and prod)
    if (import.meta.env.VITE_USE_MOCK_AUTH === 'true') {
      console.log('Using mock stats reset service');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true, message: 'Stats reset successfully' };
    }

    // Production stats reset
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/user-stats/reset`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  };
  
  const resetStatsMutation = useMutation({
    mutationFn: resetUserStats,
    onSuccess: () => {
      // Invalidate and refetch the stats query
      queryClient.invalidateQueries({ queryKey: statsQueryKey });
    },
    onError: (error) => {
      console.error('Error resetting stats:', error);
      // The error will be handled by the component
    }
  });
  
  return {
    stats,
    isLoading,
    isRefetching,
    error,
    refetch,
    resetStats: resetStatsMutation.mutate,
    isResetting: resetStatsMutation.isPending
  };
}
