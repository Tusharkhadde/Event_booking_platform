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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useEvent } from '@/hooks/useEvents';
import { formatDate, formatDateTime, getStatusColor, getInitials } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import EmptyState from '@/components/common/EmptyState';
import { toast } from '@/hooks/useToast';

function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const { data: event, isLoading, error } = useEvent(id);

  const handleBookNow = () => {
  if (!isAuthenticated) {
    toast({
      title: 'Login Required',
      description: 'Please login to book this event.',
      variant: 'destructive',
    });
    navigate('/login', { state: { from: `/book/${id}` } });
    return;
  }
  
  navigate(`/book/${id}`);
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