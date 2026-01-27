import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminService from '@/services/adminService';
import { toast } from '@/hooks/useToast';

export function useAdminUsers(role = null) {
  return useQuery({
    queryKey: ['admin-users', role],
    queryFn: () => adminService.getUsers(role),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getAdminStats,
  });
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, isApproved }) => 
      adminService.updateVendorStatus(userId, isApproved),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast({
        title: data.is_approved ? 'Vendor Approved' : 'Vendor Suspended',
        description: `Vendor status has been updated.`,
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}