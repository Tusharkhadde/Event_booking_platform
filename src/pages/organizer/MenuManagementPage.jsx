import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Plus,
  Utensils,
  Leaf,
  Drumstick,
  MoreVertical,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvent } from '@/hooks/useEvents';
import {
  useMenus,
  useCreateMenu,
  useUpdateMenu,
  useDeleteMenu,
  useAddMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from '@/hooks/useMenus';
import { menuSchema, menuItemSchema } from '@/validations/menuSchema';
import EmptyState from '@/components/common/EmptyState';

function MenuManagementPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});

  const { data: event } = useEvent(eventId);
  const { data: menus, isLoading } = useMenus(eventId);

  const createMenuMutation = useCreateMenu();
  const updateMenuMutation = useUpdateMenu();
  const deleteMenuMutation = useDeleteMenu();
  const addItemMutation = useAddMenuItem();
  const updateItemMutation = useUpdateMenuItem();
  const deleteItemMutation = useDeleteMenuItem();

  const toggleMenuExpanded = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const openAddMenu = () => {
    setEditingMenu(null);
    setIsMenuDialogOpen(true);
  };

  const openEditMenu = (menu) => {
    setEditingMenu(menu);
    setIsMenuDialogOpen(true);
  };

  const openAddItem = (menuId) => {
    setActiveMenuId(menuId);
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const openEditItem = (menuId, item) => {
    setActiveMenuId(menuId);
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleDeleteMenu = (menuId) => {
    if (confirm('Are you sure you want to delete this menu and all its items?')) {
      deleteMenuMutation.mutate(menuId);
    }
  };

  const handleDeleteItem = (itemId, menuId) => {
    if (confirm('Remove this dish from the menu?')) {
      deleteItemMutation.mutate({ itemId, menuId });
    }
  };

  const getMenuTypeIcon = (type) => {
    switch (type) {
      case 'veg':
      case 'vegan':
        return <Leaf className="h-4 w-4 text-green-600" />;
      case 'non-veg':
        return <Drumstick className="h-4 w-4 text-red-600" />;
      default:
        return <Utensils className="h-4 w-4 text-orange-600" />;
    }
  };

  const getMenuTypeColor = (type) => {
    switch (type) {
      case 'veg':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'vegan':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'non-veg':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      appetizer: '🥗 Appetizer',
      soup: '🍜 Soup',
      salad: '🥬 Salad',
      main: '🍽️ Main Course',
      side: '🍚 Side Dish',
      dessert: '🍰 Dessert',
      beverage: '🥤 Beverage',
      other: '📦 Other',
    };
    return labels[category] || category;
  };

  // Group items by category
  const groupItemsByCategory = (items) => {
    const grouped = {};
    const order = ['appetizer', 'soup', 'salad', 'main', 'side', 'dessert', 'beverage', 'other'];
    
    items?.forEach((item) => {
      const cat = item.category || 'other';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push(item);
    });

    // Sort by predefined order
    const sortedGrouped = {};
    order.forEach((cat) => {
      if (grouped[cat]) {
        sortedGrouped[cat] = grouped[cat];
      }
    });

    return sortedGrouped;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/organizer/events')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Catering Menu</h1>
            <p className="text-muted-foreground">Manage food menus for {event?.title}</p>
          </div>
        </div>
        <Button onClick={openAddMenu}>
          <Plus className="mr-2 h-4 w-4" /> Create Menu
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && <MenusSkeleton />}

      {/* Empty State */}
      {!isLoading && menus?.length === 0 && (
        <EmptyState
          icon={Utensils}
          title="No menus yet"
          description="Create your first menu to start planning the catering."
          action={openAddMenu}
          actionLabel="Create Menu"
        />
      )}

      {/* Menu Cards */}
      {!isLoading && menus?.length > 0 && (
        <div className="space-y-4">
          {menus.map((menu) => {
            const isExpanded = expandedMenus[menu.id] !== false; // Default expanded
            const groupedItems = groupItemsByCategory(menu.items);
            const totalItems = menu.items?.length || 0;
            const totalPrice = menu.items?.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) || 0;

            return (
              <Card key={menu.id}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleMenuExpanded(menu.id)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <div className="flex items-center gap-2">
                          {getMenuTypeIcon(menu.type)}
                          <CardTitle className="text-xl">{menu.name}</CardTitle>
                        </div>
                        <Badge className={getMenuTypeColor(menu.type)}>
                          {menu.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden md:block">
                          <p className="text-sm font-medium">{totalItems} dishes</p>
                          <p className="text-xs text-muted-foreground">
                            ${totalPrice.toFixed(2)} total
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openAddItem(menu.id)}>
                              <Plus className="mr-2 h-4 w-4" /> Add Dish
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditMenu(menu)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit Menu
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteMenu(menu.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete Menu
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {menu.description && (
                      <CardDescription className="ml-12">{menu.description}</CardDescription>
                    )}
                  </CardHeader>

                  <CollapsibleContent>
                    <CardContent className="pt-2">
                      {totalItems === 0 && (
                        <div className="rounded-lg border-2 border-dashed p-8 text-center">
                          <Utensils className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
                          <p className="mt-2 text-muted-foreground">No dishes added yet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => openAddItem(menu.id)}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add First Dish
                          </Button>
                        </div>
                      )}

                      {totalItems > 0 && (
                        <div className="space-y-6">
                          {Object.entries(groupedItems).map(([category, items]) => (
                            <div key={category}>
                              <h4 className="mb-3 font-semibold text-muted-foreground">
                                {getCategoryLabel(category)}
                              </h4>
                              <div className="grid gap-2">
                                {items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium">{item.name}</span>
                                          {item.is_vegetarian && (
                                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                              Veg
                                            </Badge>
                                          )}
                                          {item.is_vegan && (
                                            <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                              Vegan
                                            </Badge>
                                          )}
                                          {item.is_gluten_free && (
                                            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                                              GF
                                            </Badge>
                                          )}
                                        </div>
                                        {item.description && (
                                          <p className="text-sm text-muted-foreground">
                                            {item.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="font-medium text-primary">
                                        ${parseFloat(item.price || 0).toFixed(2)}
                                      </span>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() => openEditItem(menu.id, item)}
                                          >
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => handleDeleteItem(item.id, menu.id)}
                                            className="text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {/* Add More Button */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => openAddItem(menu.id)}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add More Dishes
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Menu Dialog */}
      <MenuDialog
        open={isMenuDialogOpen}
        onOpenChange={setIsMenuDialogOpen}
        eventId={eventId}
        menuToEdit={editingMenu}
        createMutation={createMenuMutation}
        updateMutation={updateMenuMutation}
      />

      {/* Item Dialog */}
      <MenuItemDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        menuId={activeMenuId}
        itemToEdit={editingItem}
        addMutation={addItemMutation}
        updateMutation={updateItemMutation}
      />
    </div>
  );
}

// Menu Dialog Component
function MenuDialog({ open, onOpenChange, eventId, menuToEdit, createMutation, updateMutation }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: '',
      type: 'mixed',
      description: '',
      price_per_person: '',
    },
  });

  const selectedType = watch('type');

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      if (menuToEdit) {
        reset({
          name: menuToEdit.name,
          type: menuToEdit.type,
          description: menuToEdit.description || '',
          price_per_person: menuToEdit.price_per_person?.toString() || '',
        });
      } else {
        reset({
          name: '',
          type: 'mixed',
          description: '',
          price_per_person: '',
        });
      }
    }
  });

  const onSubmit = (data) => {
    if (menuToEdit) {
      updateMutation.mutate(
        { menuId: menuToEdit.id, updates: data },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
          },
        }
      );
    } else {
      createMutation.mutate(
        { ...data, event_id: eventId },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
          },
        }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{menuToEdit ? 'Edit Menu' : 'Create Menu'}</DialogTitle>
          <DialogDescription>
            {menuToEdit ? 'Update menu details.' : 'Create a new food menu for your event.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Menu Name</Label>
            <Input {...register('name')} placeholder="e.g., Wedding Dinner Menu" />
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label>Menu Type</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="veg">🥗 Vegetarian</SelectItem>
                <SelectItem value="non-veg">🍗 Non-Vegetarian</SelectItem>
                <SelectItem value="vegan">🌱 Vegan</SelectItem>
                <SelectItem value="mixed">🍽️ Mixed</SelectItem>
                <SelectItem value="custom">✨ Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              {...register('description')}
              placeholder="Describe this menu..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Price Per Person (Optional)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                {...register('price_per_person')}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-10"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : menuToEdit ? 'Update Menu' : 'Create Menu'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Menu Item Dialog Component
function MenuItemDialog({ open, onOpenChange, menuId, itemToEdit, addMutation, updateMutation }) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'main',
      is_vegetarian: false,
      is_vegan: false,
      is_gluten_free: false,
      price: '',
    },
  });

  const selectedCategory = watch('category');
  const isVegetarian = watch('is_vegetarian');
  const isVegan = watch('is_vegan');
  const isGlutenFree = watch('is_gluten_free');

  // Reset form when dialog opens
  useState(() => {
    if (open) {
      if (itemToEdit) {
        reset({
          name: itemToEdit.name,
          description: itemToEdit.description || '',
          category: itemToEdit.category,
          is_vegetarian: itemToEdit.is_vegetarian,
          is_vegan: itemToEdit.is_vegan,
          is_gluten_free: itemToEdit.is_gluten_free,
          price: itemToEdit.price?.toString() || '',
        });
      } else {
        reset({
          name: '',
          description: '',
          category: 'main',
          is_vegetarian: false,
          is_vegan: false,
          is_gluten_free: false,
          price: '',
        });
      }
    }
  });

  const onSubmit = (data) => {
    if (itemToEdit) {
      updateMutation.mutate(
        { itemId: itemToEdit.id, updates: data },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
          },
        }
      );
    } else {
      addMutation.mutate(
        { ...data, menu_id: menuId },
        {
          onSuccess: () => {
            onOpenChange(false);
            reset();
          },
        }
      );
    }
  };

  const isLoading = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{itemToEdit ? 'Edit Dish' : 'Add Dish'}</DialogTitle>
          <DialogDescription>
            {itemToEdit ? 'Update dish details.' : 'Add a new dish to the menu.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Dish Name</Label>
            <Input {...register('name')} placeholder="e.g., Grilled Salmon" />
            {errors.name && (
              <span className="text-xs text-destructive">{errors.name.message}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appetizer">🥗 Appetizer</SelectItem>
                  <SelectItem value="soup">🍜 Soup</SelectItem>
                  <SelectItem value="salad">🥬 Salad</SelectItem>
                  <SelectItem value="main">🍽️ Main Course</SelectItem>
                  <SelectItem value="side">🍚 Side Dish</SelectItem>
                  <SelectItem value="dessert">🍰 Dessert</SelectItem>
                  <SelectItem value="beverage">🥤 Beverage</SelectItem>
                  <SelectItem value="other">📦 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  {...register('price')}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              {...register('description')}
              placeholder="Brief description of the dish..."
              rows={2}
            />
          </div>

          <div className="space-y-3">
            <Label>Dietary Options</Label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={isVegetarian}
                  onCheckedChange={(checked) => setValue('is_vegetarian', checked)}
                />
                <span className="text-sm">Vegetarian</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={isVegan}
                  onCheckedChange={(checked) => setValue('is_vegan', checked)}
                />
                <span className="text-sm">Vegan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={isGlutenFree}
                  onCheckedChange={(checked) => setValue('is_gluten_free', checked)}
                />
                <span className="text-sm">Gluten-Free</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : itemToEdit ? 'Update Dish' : 'Add Dish'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Skeleton
function MenusSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default MenuManagementPage;