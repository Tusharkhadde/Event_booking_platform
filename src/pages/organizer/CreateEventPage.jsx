import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Users,
  Image,
  Loader2,
  DollarSign,
  Plus,
  Trash2,
  Lock,
  Globe,
  Ticket,
  Check,
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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { eventSchema } from '@/validations/eventSchema';
import { useCreateEvent } from '@/hooks/useEvents';
import { EVENT_CATEGORIES } from '@/utils/constants';
import { cn } from '@/utils/cn';

function CreateEventPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventType = searchParams.get('type');
  const venueId = searchParams.get('venue');

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const createEventMutation = useCreateEvent();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: eventType || '',
      location: '',
      venue_name: '',
      venue_id: venueId || '',
      date: '',
      start_time: '',
      end_time: '',
      max_attendees: '',
      is_public: true,
      is_private_event: false,
      banner_url: '',
      // Ticket Tiers
      ticket_tiers: [
        { name: 'Normal', price: '', quantity: '', description: 'Standard admission' },
        { name: 'VIP', price: '', quantity: '', description: 'VIP access with premium benefits' },
        { name: 'VVIP', price: '', quantity: '', description: 'Ultimate experience with exclusive perks' },
      ],
    },
  });

  const { fields: ticketTiers, append: addTier, remove: removeTier } = useFieldArray({
    control,
    name: 'ticket_tiers',
  });

  const isPublic = watch('is_public');
  const isPrivateEvent = watch('is_private_event');
  const selectedCategory = watch('category');

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Event details' },
    { number: 2, title: 'Date & Venue', description: 'When & where' },
    { number: 3, title: 'Ticket Pricing', description: 'Set your prices' },
    { number: 4, title: 'Review', description: 'Confirm details' },
  ];

  const isPrivateCategoryEvent = ['wedding', 'birthday', 'anniversary', 'party'].includes(selectedCategory);

  const onSubmit = (data) => {
    // Format data for API
    const eventData = {
      title: data.title,
      description: data.description,
      category: data.category,
      location: data.location,
      venue_name: data.venue_name,
      venue_id: data.venue_id || null,
      date: data.date,
      start_time: data.start_time,
      end_time: data.end_time,
      max_attendees: data.max_attendees ? parseInt(data.max_attendees, 10) : null,
      is_public: !data.is_private_event && data.is_public,
      banner_url: data.banner_url || null,
      // Store ticket tiers as JSON
      ticket_config: JSON.stringify(data.ticket_tiers.filter(t => t.price)),
    };

    createEventMutation.mutate(eventData, {
      onSuccess: (createdEvent) => {
        if (isPrivateCategoryEvent) {
          navigate(`/organizer/events/${createdEvent.id}/planning`);
        } else {
          navigate('/organizer/events');
        }
      },
    });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">
            Set up your event with full control over pricing and details
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div
              className={cn(
                'flex flex-col items-center',
                currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2',
                  currentStep > step.number
                    ? 'bg-primary text-primary-foreground border-primary'
                    : currentStep === step.number
                    ? 'border-primary text-primary'
                    : 'border-muted-foreground'
                )}
              >
                {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
              </div>
              <span className="text-xs mt-1 hidden md:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'w-16 h-1 mx-2',
                  currentStep > step.number ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell us about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Summer Music Festival 2024"
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
                  placeholder="Describe your event in detail..."
                  rows={4}
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label>Event Category *</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => {
                    setValue('category', value);
                    // Auto-set private for personal events
                    if (['wedding', 'birthday', 'anniversary'].includes(value)) {
                      setValue('is_private_event', true);
                    }
                  }}
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
              </div>

              {/* Event Type Selection */}
              <div className="space-y-4">
                <Label>Event Type</Label>
                <RadioGroup
                  value={isPrivateEvent ? 'private' : 'public'}
                  onValueChange={(value) => setValue('is_private_event', value === 'private')}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-4 cursor-pointer',
                        !isPrivateEvent && 'border-primary bg-primary/5'
                      )}
                      onClick={() => setValue('is_private_event', false)}
                    >
                      <RadioGroupItem value="public" id="public" />
                      <div className="flex-1">
                        <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                          <Globe className="h-4 w-4" />
                          Public Event
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Anyone can discover and book tickets for this event
                        </p>
                      </div>
                    </div>
                    <div
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-4 cursor-pointer',
                        isPrivateEvent && 'border-primary bg-primary/5'
                      )}
                      onClick={() => setValue('is_private_event', true)}
                    >
                      <RadioGroupItem value="private" id="private" />
                      <div className="flex-1">
                        <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                          <Lock className="h-4 w-4" />
                          Private Event
                        </Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          Invite-only. Perfect for weddings, family gatherings, private parties
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {isPrivateCategoryEvent && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      <strong>Note:</strong> {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} events 
                      are typically private. You'll have full control over guest invitations, 
                      pricing tiers, and all event details.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="https://example.com/image.jpg"
                    className="pl-10"
                    {...register('banner_url')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Date & Venue */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Date & Venue</CardTitle>
              <CardDescription>When and where is your event?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Event Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      {...register('date')}
                    />
                  </div>
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

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="venue_name">Venue Name</Label>
                  <Input
                    id="venue_name"
                    placeholder="e.g., Grand Ballroom"
                    {...register('venue_name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Address *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="Full address"
                      className="pl-10"
                      {...register('location')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_attendees">Maximum Attendees</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="max_attendees"
                      type="number"
                      placeholder="Leave empty for unlimited"
                      className="pl-10"
                      {...register('max_attendees')}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> You can also browse and select from our verified venues 
                  in the <Button variant="link" className="p-0 h-auto" onClick={() => navigate('/venues')}>Venues Directory</Button>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Ticket Pricing */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5" />
                Ticket Pricing
              </CardTitle>
              <CardDescription>
                As the organizer, you have full control over ticket prices for each tier
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950 p-4 mb-6">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>You're in control!</strong> Set different prices for Normal, VIP, and VVIP guests. 
                  Only you can modify these prices.
                </p>
              </div>

              <div className="space-y-4">
                {ticketTiers.map((tier, index) => (
                  <div
                    key={tier.id}
                    className={cn(
                      'rounded-lg border p-4',
                      index === 0 && 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/50',
                      index === 1 && 'border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/50',
                      index === 2 && 'border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/50'
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            index === 0 && 'bg-blue-500',
                            index === 1 && 'bg-purple-500',
                            index === 2 && 'bg-yellow-500'
                          )}
                        >
                          {tier.name}
                        </Badge>
                        {index > 2 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTier(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Tier Name</Label>
                        <Input
                          {...register(`ticket_tiers.${index}.name`)}
                          placeholder="Tier name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price ($)</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-10"
                            placeholder="0.00"
                            {...register(`ticket_tiers.${index}.price`)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          placeholder="Unlimited"
                          {...register(`ticket_tiers.${index}.quantity`)}
                        />
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label>Description / Perks</Label>
                      <Textarea
                        placeholder="What's included in this tier?"
                        rows={2}
                        {...register(`ticket_tiers.${index}.description`)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => addTier({ name: '', price: '', quantity: '', description: '' })}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Tier
              </Button>

              {isPrivateEvent && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950 p-4">
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    <strong>Private Event Pricing:</strong> Since this is a private event, 
                    you can set custom prices or make it free for your guests. 
                    Only invited guests will be able to RSVP.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Event</CardTitle>
              <CardDescription>
                Make sure everything looks good before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Event Details
                  </h3>
                  <div className="rounded-lg bg-muted p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Title</span>
                      <span className="font-medium">{watch('title') || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category</span>
                      <Badge variant="secondary" className="capitalize">
                        {watch('category') || '-'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant={isPrivateEvent ? 'default' : 'outline'}>
                        {isPrivateEvent ? 'Private' : 'Public'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span>{watch('date') || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span>
                        {watch('start_time') || '-'} - {watch('end_time') || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-right max-w-[200px] truncate">
                        {watch('location') || '-'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ticket Pricing */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Ticket Pricing
                  </h3>
                  <div className="rounded-lg bg-muted p-4 space-y-3">
                    {ticketTiers
                      .filter((t) => t.price)
                      .map((tier, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{tier.name}</span>
                            {tier.quantity && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({tier.quantity} available)
                              </span>
                            )}
                          </div>
                          <span className="text-lg font-bold text-primary">
                            ${parseFloat(tier.price || 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    {ticketTiers.filter((t) => t.price).length === 0 && (
                      <p className="text-muted-foreground text-center py-2">
                        No ticket pricing set
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4">
                <p className="text-sm text-green-700 dark:text-green-300">
                  <strong>Ready to launch!</strong> You can always edit these details after creating the event.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button type="button" onClick={nextStep}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={createEventMutation.isPending}>
              {createEventMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default CreateEventPage;