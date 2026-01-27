// src/hooks/useVendorReviews.js
import { useQuery } from '@tanstack/react-query';
import vendorService from '@/services/vendorService';

export function useVendorReviews(vendorId) {
  return useQuery({
    queryKey: ['vendor-reviews', vendorId],
    queryFn: () => vendorService.getVendorReviews(vendorId),
    enabled: !!vendorId,
  });
}

export function useVendorRatingSummary(vendorId) {
  return useQuery({
    queryKey: ['vendor-rating-summary', vendorId],
    queryFn: () => vendorService.getVendorRatingSummary(vendorId),
    enabled: !!vendorId,
  });
}