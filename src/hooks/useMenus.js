import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import menuService from '@/services/menuService';
import { toast } from '@/hooks/useToast';

// Get all menus for an event
export function useMenus(eventId) {
  return useQuery({
    queryKey: ['menus', eventId],
    queryFn: () => menuService.getMenus(eventId),
    enabled: !!eventId,
  });
}

// Get single menu
export function useMenu(menuId) {
  return useQuery({
    queryKey: ['menu', menuId],
    queryFn: () => menuService.getMenuById(menuId),
    enabled: !!menuId,
  });
}

// Create menu
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.createMenu,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menus', data.event_id] });
      toast({
        title: 'Menu Created',
        description: 'Your menu has been created successfully.',
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

// Update menu
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ menuId, updates }) => menuService.updateMenu(menuId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menus', data.event_id] });
      queryClient.invalidateQueries({ queryKey: ['menu', data.id] });
      toast({
        title: 'Menu Updated',
        description: 'Your menu has been updated.',
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

// Delete menu
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.deleteMenu,
    onSuccess: (_, menuId) => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast({
        title: 'Menu Deleted',
        description: 'The menu has been removed.',
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

// Add menu item
export function useAddMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuService.addMenuItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', data.menu_id] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast({
        title: 'Item Added',
        description: 'Dish has been added to the menu.',
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

// Update menu item
export function useUpdateMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, updates }) => menuService.updateMenuItem(itemId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['menu', data.menu_id] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast({
        title: 'Item Updated',
        description: 'Dish has been updated.',
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

// Delete menu item
export function useDeleteMenuItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, menuId }) => menuService.deleteMenuItem(itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['menu', variables.menuId] });
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast({
        title: 'Item Removed',
        description: 'Dish has been removed from the menu.',
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