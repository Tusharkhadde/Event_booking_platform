import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Users,
  Image,
  Loader2,
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
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { eventSchema } from '@/validations/eventSchema';
import { useEvent, useUpdateEvent } from '@/hooks/useEvents';
import { EVENT_CATEGORIES } from '@/utils/constants';
import EmptyState from '@/components/common/EmptyState';

function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading, error } = useEvent(id);
  const updateEventMutation = useUpdateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      location: '',
      venue_name: '',
      date: '',
      start_time: '',
      end_time: '',
      max_attendees: '',
      is_public: true,
      banner_url: '',
    },
  });

  // Populate form when event data is loaded
  useEffect(() => {
    if (event) {
      reset({
        title: event.title || '',
        description: event.description || '',
        category: event.category || '',
        location: event.location || '',
        venue_name: event.venue_name || '',
        date: event.date || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        max_attendees: event.max_attendees?.toString() || '',
        is_public: event.is_public ?? true,
        banner_url: event.banner_url || '',
      });
    }
  }, [event, reset]);

  const isPublic = watch('is_public');
  const selectedCategory = watch('category');

  const onSubmit = (data) => {
    const updates = {
      ...data,
      max_attendees: data.max_attendees ? parseInt(data.max_attendees, 10) : null,
    };

    updateEventMutation.mutate(
      { eventId: id, updates },
      {
        onSuccess: () => {
          navigate('/organizer/events');
        },
      }
    );
  };

  if (isLoading) {
    return <EditEventSkeleton />;
  }

  if (error || !event) {
    return (
      <div className="py-16">
        <EmptyState
          icon={Calendar}
          title="Event not found"
          description="The event you're trying to edit doesn't exist."
          action={() => navigate('/organizer/events')}
          actionLabel="Back to Events"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">Update your event details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update the main details of your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event..."
                    rows={4}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={(value) => setValue('category', value, { shouldDirty: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner_url">Banner Image URL</Label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="banner_url"
                      placeholder="https://example.com/image.jpg"
                      className="pl-10"
                      {...register('banner_url')}
                    />
                  </div>
                  {errors.banner_url && (
                    <p className="text-sm text-destructive">
                      {errors.banner_url.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time */}
            <Card>
              <CardHeader>
                <CardTitle>Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        {...register('date')}
                      />
                    </div>
                    {errors.date && (
                      <p className="text-sm text-destructive">{errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="start_time"
                        type="time"
                        className="pl-10"
                        {...register('start_time')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="end_time"
                        type="time"
                        className="pl-10"
                        {...register('end_time')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="venue_name">Venue Name</Label>
                  <Input
                    id="venue_name"
                    placeholder="Enter venue name"
                    {...register('venue_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Enter full address"
                      className="pl-10"
                      {...register('location')}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Maximum Attendees</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="max_attendees"
                      type="number"
                      placeholder="Unlimited"
                      className="pl-10"
                      {...register('max_attendees')}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_public">Public Event</Label>
                    <p className="text-sm text-muted-foreground">
                      Anyone can discover this event
                    </p>
                  </div>
                  <Switch
                    id="is_public"
                    checked={isPublic}
                    onCheckedChange={(checked) => setValue('is_public', checked, { shouldDirty: true })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={updateEventMutation.isPending || !isDirty}
              >
                {updateEventMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {updateEventMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/organizer/events')}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function EditEventSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EditEventPage;