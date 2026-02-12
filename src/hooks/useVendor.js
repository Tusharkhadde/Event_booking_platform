import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import vendorService from '@/services/vendorService';
import useAuthStore from '@/store/authStore';
import { toast } from '@/hooks/useToast';

// Services
export function useVendorServices() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['vendor-services', user?.id],
    queryFn: () => vendorService.getVendorServices(user.id),
    enabled: !!user?.id,
  });
}

export function useAllServices(filters = {}) {
  return useQuery({
    queryKey: ['all-services', filters],
    queryFn: () => vendorService.getAllActiveServices(filters),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: (serviceData) => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return vendorService.createService({ ...serviceData, vendor_id: user.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      toast({
        title: 'Service Created',
        description: 'Your service has been listed successfully.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ serviceId, updates }) =>
      vendorService.updateService(serviceId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      toast({
        title: 'Service Updated',
        description: 'Your service has been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorService.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-services'] });
      toast({
        title: 'Service Deleted',
        description: 'Your service has been removed.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Bookings
export function useVendorBookings(status = null) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['vendor-bookings', user?.id, status],
    queryFn: () => vendorService.getVendorBookings(user.id, status),
    enabled: !!user?.id,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status, notes }) =>
      vendorService.updateBookingStatus(bookingId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-bookings'] });
      toast({
        title: 'Booking Updated',
        description: 'Booking status has been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Stats
export function useVendorStats() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['vendor-stats', user?.id],
    queryFn: () => vendorService.getVendorStats(user.id),
    enabled: !!user?.id,
  });
}

// Reviews
export function useVendorReviews() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['vendor-reviews', user?.id],
    queryFn: () => vendorService.getVendorReviews(user.id),
    enabled: !!user?.id,
  });
}

export function useVendorRating() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['vendor-rating', user?.id],
    queryFn: () => vendorService.getVendorRatingSummary(user.id),
    enabled: !!user?.id,
  });
}