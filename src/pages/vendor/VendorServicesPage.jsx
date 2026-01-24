import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Briefcase,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useVendorServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '@/hooks/useVendor';
import { formatCurrency } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

const SERVICE_CATEGORIES = [
  { value: 'catering', label: '🍽️ Catering' },
  { value: 'photography', label: '📷 Photography' },
  { value: 'videography', label: '🎥 Videography' },
  { value: 'decoration', label: '🎨 Decoration' },
  { value: 'music', label: '🎵 Music / DJ' },
  { value: 'flowers', label: '💐 Flowers' },
  { value: 'cake', label: '🎂 Cake' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'venue', label: '🏛️ Venue' },
  { value: 'other', label: '📦 Other' },
];

const serviceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  price_range_min: z.string().optional(),
  price_range_max: z.string().optional(),
  price_type: z.enum(['fixed', 'hourly', 'per_person', 'custom']).default('fixed'),
});

function VendorServicesPage() {
  const { data: services, isLoading } = useVendorServices();
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deleteServiceId, setDeleteServiceId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      category: '',
      description: '',
      price_range_min: '',
      price_range_max: '',
      price_type: 'fixed',
    },
  });

  const selectedCategory = watch('category');
  const selectedPriceType = watch('price_type');

  const openCreateDialog = () => {
    setEditingService(null);
    reset({
      name: '',
      category: '',
      description: '',
      price_range_min: '',
      price_range_max: '',
      price_type: 'fixed',
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service) => {
    setEditingService(service);
    reset({
      name: service.name,
      category: service.category,
      description: service.description || '',
      price_range_min: service.price_range_min?.toString() || '',
      price_range_max: service.price_range_max?.toString() || '',
      price_type: service.price_type || 'fixed',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data) => {
    const serviceData = {
      ...data,
      price_range_min: data.price_range_min ? parseFloat(data.price_range_min) : null,
      price_range_max: data.price_range_max ? parseFloat(data.price_range_max) : null,
    };

    if (editingService) {
      updateMutation.mutate(
        { serviceId: editingService.id, updates: serviceData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            reset();
          },
        }
      );
    } else {
      createMutation.mutate(serviceData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          reset();
        },
      });
    }
  };

  const handleToggleActive = (service) => {
    updateMutation.mutate({
      serviceId: service.id,
      updates: { is_active: !service.is_active },
    });
  };

  const handleDelete = () => {
    if (deleteServiceId) {
      deleteMutation.mutate(deleteServiceId, {
        onSuccess: () => setDeleteServiceId(null),
      });
    }
  };

  const getCategoryLabel = (value) => {
    return SERVICE_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Services</h1>
          <p className="text-muted-foreground">
            Manage the services you offer to event organizers
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Service
        </Button>
      </div>

      {/* Services Grid */}
      {isLoading && <ServicesSkeleton />}

      {!isLoading && services?.length === 0 && (
        <Card className="py-16">
          <CardContent>
            <EmptyState
              icon={Briefcase}
              title="No services yet"
              description="Start by adding your first service to attract event organizers."
              action={openCreateDialog}
              actionLabel="Add Service"
            />
          </CardContent>
        </Card>
      )}

      {!isLoading && services?.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onEdit={() => openEditDialog(service)}
              onDelete={() => setDeleteServiceId(service.id)}
              onToggleActive={() => handleToggleActive(service)}
              getCategoryLabel={getCategoryLabel}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Update your service details'
                : 'Describe the service you offer to event organizers'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                {...register('name')}
                placeholder="e.g., Wedding Photography Package"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                {...register('description')}
                placeholder="Describe what's included in your service..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Pricing Type</Label>
              <Select
                value={selectedPriceType}
                onValueChange={(value) => setValue('price_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="hourly">Per Hour</SelectItem>
                  <SelectItem value="per_person">Per Person</SelectItem>
                  <SelectItem value="custom">Custom Quote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register('price_range_min')}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Max Price ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...register('price_range_max')}
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingService
                  ? 'Update Service'
                  : 'Add Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteServiceId}
        onOpenChange={() => setDeleteServiceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this service. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServiceCard({ service, onEdit, onDelete, onToggleActive, getCategoryLabel }) {
  return (
    <Card className={!service.is_active ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="secondary">{getCategoryLabel(service.category)}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleActive}>
                {service.is_active ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg">{service.name}</CardTitle>
      </CardHeader>
      <CardContent>
        {service.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {service.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-primary">
            {service.price_range_min && service.price_range_max ? (
              <>
                {formatCurrency(service.price_range_min)} -{' '}
                {formatCurrency(service.price_range_max)}
              </>
            ) : service.price_range_min ? (
              <>From {formatCurrency(service.price_range_min)}</>
            ) : (
              'Contact for pricing'
            )}
          </div>
          <Badge variant={service.is_active ? 'default' : 'secondary'}>
            {service.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function ServicesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default VendorServicesPage;