import { Link } from 'react-router-dom';
import {
  Calendar,
  Ticket,
  Heart,
  Clock,
  MapPin,
  Bell,
  Star,
  ChevronRight,
  PartyPopper,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import useAuthStore from '@/store/authStore';
import { formatDate, getInitials } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function CustomerDashboard() {
  const { profile } = useAuthStore();

  // Mock data - In real app, fetch from Supabase
  const upcomingEvents = [
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      date: '2024-07-15',
      time: '18:00',
      location: 'Central Park, NYC',
      status: 'confirmed',
      ticket_type: 'VIP',
      banner_url: null,
    },
    {
      id: '2',
      title: 'Tech Conference 2024',
      date: '2024-08-20',
      time: '09:00',
      location: 'Convention Center, SF',
      status: 'confirmed',
      ticket_type: 'Standard',
      banner_url: null,
    },
  ];

  const pendingInvites = [
    {
      id: '1',
      event_title: "John & Sarah's Wedding",
      event_date: '2024-09-15',
      host_name: 'John Doe',
      rsvp_status: 'pending',
    },
    {
      id: '2',
      event_title: 'Birthday Celebration',
      event_date: '2024-07-25',
      host_name: 'Jane Smith',
      rsvp_status: 'pending',
    },
  ];

  const savedEvents = [
    {
      id: '3',
      title: 'Jazz Night Live',
      date: '2024-08-10',
      location: 'Blue Note Club',
      price: '$45',
    },
  ];

  const stats = {
    totalBookings: 5,
    upcomingEvents: 2,
    pendingInvites: 2,
    savedEvents: 3,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-xl">
              {getInitials(profile?.name || 'User')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {profile?.name?.split(' ')[0] || 'there'}!</h1>
            <p className="text-muted-foreground">Here's what's happening with your events</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/events">
            <Calendar className="mr-2 h-4 w-4" />
            Discover Events
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <QuickStatCard
          icon={Ticket}
          label="Total Bookings"
          value={stats.totalBookings}
          color="bg-blue-500"
        />
        <QuickStatCard
          icon={Calendar}
          label="Upcoming Events"
          value={stats.upcomingEvents}
          color="bg-green-500"
        />
        <QuickStatCard
          icon={Bell}
          label="Pending Invites"
          value={stats.pendingInvites}
          color="bg-yellow-500"
        />
        <QuickStatCard
          icon={Heart}
          label="Saved Events"
          value={stats.savedEvents}
          color="bg-pink-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Your Upcoming Events</CardTitle>
              <CardDescription>Events you're attending soon</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-bookings">
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">No upcoming events</p>
                <Button variant="link" asChild>
                  <Link to="/events">Browse events</Link>
                </Button>
              </div>
            )}
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <UpcomingEventCard key={event.id} event={event} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Invites */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <PartyPopper className="h-5 w-5 text-primary" />
                Event Invitations
              </CardTitle>
              <CardDescription>You've been invited!</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {pendingInvites.length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
                <p className="mt-2 text-muted-foreground">No pending invitations</p>
              </div>
            )}
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <InviteCard key={invite.id} invite={invite} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saved Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Saved Events
            </CardTitle>
            <CardDescription>Events you're interested in</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {savedEvents.length === 0 && (
            <div className="text-center py-8">
              <Heart className="mx-auto h-10 w-10 text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">No saved events yet</p>
              <Button variant="link" asChild>
                <Link to="/events">Explore events</Link>
              </Button>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            {savedEvents.map((event) => (
              <SavedEventCard key={event.id} event={event} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Recommended For You
          </CardTitle>
          <CardDescription>Based on your interests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-center">
            <div>
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-2 text-muted-foreground">
                We're learning your preferences. Book more events to get personalized recommendations!
              </p>
              <Button className="mt-4" asChild>
                <Link to="/events">Explore Events</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sub-components

function QuickStatCard({ icon: Icon, label, value, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingEventCard({ event }) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Calendar className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{event.title}</p>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(event.date)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {event.location}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant="secondary">{event.ticket_type}</Badge>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          {event.status}
        </Badge>
      </div>
    </div>
  );
}

function InviteCard({ invite }) {
  return (
    <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-transparent">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-semibold">{invite.event_title}</p>
          <p className="text-sm text-muted-foreground">
            Hosted by {invite.host_name} • {formatDate(invite.event_date)}
          </p>
        </div>
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          Pending RSVP
        </Badge>
      </div>
      <div className="flex gap-2">
        <Button size="sm" className="flex-1">
          Accept
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Decline
        </Button>
        <Button size="sm" variant="ghost">
          View Details
        </Button>
      </div>
    </div>
  );
}

function SavedEventCard({ event }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-muted flex items-center justify-center">
        <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
      </div>
      <CardContent className="p-3">
        <p className="font-medium truncate">{event.title}</p>
        <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-semibold">{event.price}</span>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/events/${event.id}`}>Book Now</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CustomerDashboard;