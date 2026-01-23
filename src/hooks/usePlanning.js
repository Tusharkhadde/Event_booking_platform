import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import planningService from '@/services/planningService';
import { toast } from '@/hooks/useToast';

export function usePlanningTemplate(eventId) {
  return useQuery({
    queryKey: ['planning-template', eventId],
    queryFn: () => planningService.getTemplate(eventId),
    enabled: !!eventId,
  });
}

export function usePlanningNotes(eventId) {
  return useQuery({
    queryKey: ['planning-notes', eventId],
    queryFn: () => planningService.getNotes(eventId),
    enabled: !!eventId,
  });
}

export function usePlanningItems(eventId) {
  return useQuery({
    queryKey: ['planning-items', eventId],
    queryFn: () => planningService.getItems(eventId),
    enabled: !!eventId,
  });
}

export function usePlanningItemsBySection(eventId, sectionId) {
  return useQuery({
    queryKey: ['planning-items', eventId, sectionId],
    queryFn: () => planningService.getItemsBySection(eventId, sectionId),
    enabled: !!eventId && !!sectionId,
  });
}

export function usePlanningItemStats(eventId) {
  return useQuery({
    queryKey: ['planning-item-stats', eventId],
    queryFn: () => planningService.getItemStats(eventId),
    enabled: !!eventId,
  });
}

export function useUpsertTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, templateData }) => 
      planningService.upsertTemplate(eventId, templateData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['planning-template', variables.eventId] 
      });
      toast({
        title: 'Template saved!',
        description: 'Planning template has been saved.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpsertNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, sectionId, content }) => 
      planningService.upsertNote(eventId, sectionId, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['planning-notes', variables.eventId] 
      });
      toast({
        title: 'Note saved!',
        description: 'Your note has been saved.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to save note',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreatePlanningItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: planningService.createItem,
    onSuccess: (data, variables) => {
      const eventId = data?.event_id || variables?.event_id;
      if (eventId) {
        queryClient.invalidateQueries({ 
          queryKey: ['planning-items', eventId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['planning-item-stats', eventId] 
        });
      }
      toast({
        title: 'Item added!',
        description: 'Planning item has been added.',
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

export function useUpdatePlanningItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, updates }) => 
      planningService.updateItem(itemId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['planning-items', data.event_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['planning-item-stats', data.event_id] 
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useTogglePlanningItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, isCompleted }) => 
      planningService.toggleItemComplete(itemId, isCompleted),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: ['planning-items', data.event_id] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['planning-item-stats', data.event_id] 
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeletePlanningItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, eventId }) => planningService.deleteItem(itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['planning-items', variables.eventId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['planning-item-stats', variables.eventId] 
      });
      toast({
        title: 'Item deleted!',
        description: 'Planning item has been removed.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}