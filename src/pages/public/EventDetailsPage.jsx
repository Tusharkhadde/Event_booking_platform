import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Share2,
  Heart,
  Ticket,
  User,
  Star,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEventReviews, useEventRatingSummary, useAddEventReview } from '@/hooks/useReviews';
import { eventReviewSchema } from '@/validations/reviewSchema';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useEvent } from '@/hooks/useEvents';
import { formatDate, formatDateTime, getStatusColor, getInitials } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';
import { toast } from '@/hooks/useToast';
import { EVENT_THEMES } from '@/data/themes';

// Helper to map theme ID to data
function getThemeById(themeId) {
  if (!themeId) {
    return null;
  }
  let found = null;
  EVENT_THEMES.forEach((t) => {
    if (t.id === themeId) {
      found = t;
    }
  });
  return found;
}

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const { data: event, isLoading, error } = useEvent(id);
  const { data: reviews, isLoading: reviewsLoading } = useEventReviews(id);
  const { data: ratingSummary } = useEventRatingSummary(id);
  const addReviewMutation = useAddEventReview(id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: reviewErrors },
  } = useForm({
    resolver: zodResolver(eventReviewSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  const handleReviewSubmit = (values) => {
    const ratingNumber = Number(values.rating);
    addReviewMutation.mutate(
      {
        rating: ratingNumber,
        comment: values.comment,
      },
      {
        onSuccess: () => {
          reset({ rating: 5, comment: '' });
        },
      }
    );
  };

  // const handleBookNow = () => {
  //   if (!isAuthenticated) {
  //     toast({
  //       title: 'Login Required',
  //       description: 'Please login to book this event.',
  //       variant: 'destructive',
  //     });
  //     navigate('/login', { state: { from: `/book/${id}` } });
  //     return;
  //   }
  //   navigate(`/book/${id}`);
  // };
  const handleBookNow = () => {
    // Pass event data through navigation state
    navigate(`/book/${event.id}`, { 
      state: { 
        event: {
          ...event,
          // Ensure ticket_types are included
          ticket_types: event.ticket_types || [
            {
              id: 'vip',
              name: 'VIP Pass',
              type: 'vip',
              description: 'Premium experience with exclusive benefits',
              price: 199.99,
              originalPrice: 249.99,
              features: ['Front Row Seats', 'Meet & Greet', 'Exclusive Merch'],
              available: 50,
            },
            {
              id: 'premium',
              name: 'Premium',
              type: 'premium',
              description: 'Great seats with premium benefits',
              price: 149.99,
              features: ['Priority Seating', 'Complimentary Drinks'],
              available: 100,
            },
            {
              id: 'regular',
              name: 'General Admission',
              type: 'regular',
              description: 'Standard entry to the event',
              price: 79.99,
              features: ['General Seating', 'Event Access'],
              available: 500,
            },
          ],
        } 
      } 
    });
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: url,
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link Copied',
        description: 'Event link has been copied to clipboard.',
      });
    }
  };

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={Calendar}
          title="Failed to load event"
          description="There was an error loading the event details. Please try again."
          action={() => navigate('/events')}
          actionLabel="Back to Events"
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={Calendar}
          title="Event not found"
          description="The event you're looking for doesn't exist or has been removed."
          action={() => navigate('/events')}
          actionLabel="Back to Events"
        />
      </div>
    );
  }

  // Get theme data after event is loaded
  const theme = getThemeById(event?.theme_name);

  return (
    <div className="container py-8">
      {/* Back Button */}
      <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Banner Image */}
          <div className="mb-6 aspect-video overflow-hidden rounded-lg bg-muted">
            {event.banner_url && (
              <img
                src={event.banner_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            )}
            {!event.banner_url && (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Event Header */}
          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {event.category}
              </Badge>
              <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
            </div>
            <h1 className="mb-2 text-3xl font-bold">{event.title}</h1>
            
            {/* Organizer Info */}
            {event.organizer && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={event.organizer.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {getInitials(event.organizer.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  Organized by <strong>{event.organizer.name}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="mb-6 flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(event.date, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            {event.start_time && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>
                  {event.start_time}
                  {event.end_time && ` - ${event.end_time}`}
                </span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
            )}
            {event.max_attendees && (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>{event.max_attendees} attendees max</span>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Description */}
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">About This Event</h2>
            {event.description && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {event.description}
                </p>
              </div>
            )}
            {!event.description && (
              <p className="text-muted-foreground">
                No description available for this event.
              </p>
            )}
          </div>

          {/* Venue Information */}
          {event.venue_name && (
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">Venue</h2>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{event.venue_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Theme & Decoration */}
          {theme && (
            <div className="mb-6">
              <h2 className="mb-2 text-xl font-semibold">Theme & Decoration</h2>
              <p className="text-sm text-muted-foreground mb-2">
                {theme.description}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Primary
                  </span>
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: theme.palette.primary }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Secondary
                  </span>
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: theme.palette.secondary }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs uppercase text-muted-foreground">
                    Accent
                  </span>
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: theme.palette.accent }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Event Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Event Status Info */}
              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Date</span>
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                {event.status === 'upcoming' && (
                  <Button className="w-full" size="lg" onClick={handleBookNow}>
                    <Ticket className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                )}
                {event.status === 'live' && (
                  <Button className="w-full" size="lg" variant="secondary">
                    Event is Live
                  </Button>
                )}
                {event.status === 'completed' && (
                  <Button className="w-full" size="lg" variant="secondary" disabled>
                    Event Ended
                  </Button>
                )}
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleShare}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Heart className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Contact Organizer */}
              {event.organizer && (
                <div className="pt-4">
                  <Separator className="mb-4" />
                  <p className="mb-2 text-sm font-medium">Questions?</p>
                  <p className="text-sm text-muted-foreground">
                    Contact the organizer for more information.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews & Ratings Section */}
      <section className="mt-10">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  Reviews & Ratings
                </CardTitle>
                <CardDescription>
                  Feedback from attendees
                </CardDescription>
              </div>
              {ratingSummary && ratingSummary.count > 0 && (
                <div className="text-right">
                  <p className="text-3xl font-bold">
                    {ratingSummary.average.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Based on {ratingSummary.count} review
                    {ratingSummary.count > 1 && 's'}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add review form */}
            {isAuthenticated && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Leave a Review</p>
                <form
                  className="space-y-3"
                  onSubmit={handleSubmit(handleReviewSubmit)}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-muted-foreground">
                        Your rating:
                      </span>
                      <select
                        className="h-8 rounded border bg-background text-sm px-2"
                        {...register('rating')}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ 5</option>
                        <option value={4}>⭐⭐⭐⭐ 4</option>
                        <option value={3}>⭐⭐⭐ 3</option>
                        <option value={2}>⭐⭐ 2</option>
                        <option value={1}>⭐ 1</option>
                      </select>
                    </div>
                    {reviewErrors.rating && (
                      <p className="text-xs text-destructive">
                        {reviewErrors.rating.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Textarea
                      placeholder="Share your experience..."
                      rows={3}
                      {...register('comment')}
                    />
                    {reviewErrors.comment && (
                      <p className="text-xs text-destructive">
                        {reviewErrors.comment.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={addReviewMutation.isPending}
                  >
                    {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              </div>
            )}

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground">
                Please{' '}
                <Button
                  variant="link"
                  className="px-1 text-sm"
                  onClick={() => navigate('/login', { state: { from: `/events/${id}` } })}
                >
                  log in
                </Button>
                to leave a review.
              </p>
            )}

            {/* Reviews list */}
            {reviewsLoading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            )}

            {!reviewsLoading && reviews && reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Be the first to share your experience.
              </p>
            )}

            {!reviewsLoading && reviews && reviews.length > 0 && (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-3 flex gap-3"
                  >
                    <div className="flex flex-col items-center">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, idx) => {
                          const filled = idx < review.rating;
                          return (
                            <Star
                              key={idx}
                              className={
                                filled
                                  ? 'h-4 w-4 text-yellow-500 fill-yellow-500'
                                  : 'h-4 w-4 text-muted-foreground'
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {(review.user && review.user.name) || 'Anonymous'}
                      </p>
                      <p className="text-xs text-muted-foreground mb-1">
                        {formatDate(review.created_at)}
                      </p>
                      {review.comment && (
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function EventDetailsSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="mb-6 h-10 w-24" />
      
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Skeleton className="mb-6 aspect-video rounded-lg" />
          <Skeleton className="mb-2 h-6 w-32" />
          <Skeleton className="mb-4 h-10 w-3/4" />
          <Skeleton className="mb-6 h-5 w-48" />
          
          <div className="mb-6 flex gap-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-40" />
          </div>
          
          <Skeleton className="mb-4 h-px w-full" />
          
          <Skeleton className="mb-4 h-6 w-40" />
          <Skeleton className="h-24 w-full" />
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-12 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 flex-1" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EventDetailsPage;