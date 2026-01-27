// src/hooks/useBudget.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import budgetService from '@/services/budgetService';
import { toast } from '@/hooks/useToast';

export function useBudget(eventId) {
  return useQuery({
    queryKey: ['budget', eventId],
    queryFn: () => budgetService.getOrCreateBudget(eventId),
    enabled: !!eventId,
  });
}

export function useBudgetItems(budgetId) {
  return useQuery({
    queryKey: ['budget-items', budgetId],
    queryFn: () => budgetService.getBudgetItems(budgetId),
    enabled: !!budgetId,
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ budgetId, updates }) =>
      budgetService.updateBudget(budgetId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget', data.event_id] });
      toast({
        title: 'Budget updated',
        description: 'Your event budget has been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update budget',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useAddBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: budgetService.addBudgetItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', data.budget_id] });
      toast({
        title: 'Expense added',
        description: 'Budget item has been added.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteBudgetItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, budgetId }) => budgetService.deleteBudgetItem(itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budget-items', variables.budgetId] });
      toast({
        title: 'Item removed',
        description: 'Budget item has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to remove item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}