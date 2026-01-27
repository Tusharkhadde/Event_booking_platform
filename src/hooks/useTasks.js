// src/hooks/useTasks.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import taskService from '@/services/taskService';
import { toast } from '@/hooks/useToast';

export function useEventTasks(eventId) {
  return useQuery({
    queryKey: ['event-tasks', eventId],
    queryFn: () => taskService.getTasksByEvent(eventId),
    enabled: !!eventId,
  });
}

export function useCreateTask(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-tasks', eventId] });
      toast({
        title: 'Task added',
        description: 'A new task has been added to your checklist.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateTask(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, updates }) => taskService.updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-tasks', eventId] });
      toast({
        title: 'Task updated',
        description: 'Task has been updated.',
        variant: 'success',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteTask(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId) => taskService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-tasks', eventId] });
      toast({
        title: 'Task removed',
        description: 'Task has been deleted from your checklist.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useToggleTaskStatus(eventId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, status }) =>
      taskService.toggleTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-tasks', eventId] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update status',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}