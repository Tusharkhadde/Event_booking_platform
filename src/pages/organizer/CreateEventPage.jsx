import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { eventSchema } from '@/validations/eventSchema';
import { useCreateEvent } from '@/hooks/useEvents';
import { EVENT_CATEGORIES } from '@/utils/constants';

function CreateEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventType = searchParams.get('type');

  const createEventMutation = useCreateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      category: eventType || '',
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

  const isPublic = watch('is_public');
  const selectedCategory = watch('category');

  const onSubmit = (data) => {
    const eventData = {
      ...data,
      max_attendees: data.max_attendees ? parseInt(data.max_attendees, 10) : null,
    };

    createEventMutation.mutate(eventData, {
      onSuccess: (createdEvent) => {
        if (selectedCategory === 'wedding' || selectedCategory === 'party') {
          navigate(`/organizer/events/${createdEvent.id}/planning`);
        } else {
          navigate('/organizer/events');
        }
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">
            Fill in the details to create your event
          </p>
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
                  Enter the main details of your event
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
                    onValueChange={(value) => setValue('category', value)}
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
                <CardDescription>When will your event take place?</CardDescription>
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
                <CardDescription>Where will your event be held?</CardDescription>
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
            {/* Capacity & Visibility */}
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
                    onCheckedChange={(checked) => setValue('is_public', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Planning Tip */}
            {(selectedCategory === 'wedding' || selectedCategory === 'party') && (
              <Card className="border-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Planning Tools Available</p>
                      <p className="text-sm text-muted-foreground">
                        After creating this event, you'll have access to our{' '}
                        {selectedCategory} planning tools with templates, checklists,
                        and more.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={createEventMutation.isPending}
            >
              {createEventMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CreateEventPage;