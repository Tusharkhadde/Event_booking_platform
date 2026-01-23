import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Ticket,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
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
import { Skeleton } from '@/components/ui/skeleton';
import { useOrganizerEvents, useEventStats } from '@/hooks/useEvents';
import { formatDate, getStatusColor } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function OrganizerDashboard() {
  const { data: events, isLoading: eventsLoading } = useOrganizerEvents();
  const { data: stats, isLoading: statsLoading } = useEventStats();

  const recentEvents = events?.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your events and track performance
          </p>
        </div>
        <Button asChild>
          <Link to="/organizer/events/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={stats?.total || 0}
          icon={Calendar}
          description="All time events"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Upcoming"
          value={stats?.upcoming || 0}
          icon={Clock}
          description="Events coming up"
          isLoading={statsLoading}
          variant="blue"
        />
        <StatsCard
          title="Live"
          value={stats?.live || 0}
          icon={TrendingUp}
          description="Currently active"
          isLoading={statsLoading}
          variant="green"
        />
        <StatsCard
          title="Completed"
          value={stats?.completed || 0}
          icon={CheckCircle}
          description="Successfully ended"
          isLoading={statsLoading}
          variant="gray"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Events */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Your latest created events</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/organizer/events">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {eventsLoading && <RecentEventsSkeleton />}

            {!eventsLoading && recentEvents.length === 0 && (
              <EmptyState
                icon={Calendar}
                title="No events yet"
                description="Create your first event to get started"
                action={() => {}}
                actionLabel="Create Event"
              />
            )}

            {!eventsLoading && recentEvents.length > 0 && (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(event.date)} • {event.location || 'No location'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/organizer/events/edit/${event.id}`}>
                          Manage
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickActionButton
              icon={Plus}
              label="Create New Event"
              to="/organizer/events/create"
            />
            <QuickActionButton
              icon={Calendar}
              label="View Calendar"
              to="/organizer/calendar"
            />
            <QuickActionButton
              icon={Users}
              label="Manage Guests"
              to="/organizer/events"
            />
            <QuickActionButton
              icon={Ticket}
              label="Check-in Dashboard"
              to="/organizer/events"
            />
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tips & Best Practices</CardTitle>
            <CardDescription>Make your events successful</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TipItem
              title="Complete Event Details"
              description="Events with complete details get 3x more bookings"
            />
            <TipItem
              title="Add Event Banner"
              description="Visual events attract more attendees"
            />
            <TipItem
              title="Set Up Early Bird Pricing"
              description="Encourage early registrations with discounts"
            />
            <TipItem
              title="Send Reminders"
              description="Reduce no-shows with automated reminders"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, description, isLoading, variant = 'default' }) {
  const variantStyles = {
    default: 'bg-primary/10 text-primary',
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400',
    green: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400',
    gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            {isLoading && (
              <>
                <Skeleton className="mb-1 h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </>
            )}
            {!isLoading && (
              <>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
              </>
            )}
          </div>
          <div className={`rounded-full p-3 ${variantStyles[variant]}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        {!isLoading && (
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickActionButton({ icon: Icon, label, to }) {
  return (
    <Button variant="outline" className="w-full justify-start" asChild>
      <Link to={to}>
        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}

function TipItem({ title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function RecentEventsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div>
              <Skeleton className="mb-1 h-5 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default OrganizerDashboard;