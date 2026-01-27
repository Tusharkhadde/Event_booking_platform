// src/hooks/useAnalytics.js
import { useQuery } from '@tanstack/react-query';
import analyticsService from '@/services/analyticsService';

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: analyticsService.getAdminAnalytics,
  });
}