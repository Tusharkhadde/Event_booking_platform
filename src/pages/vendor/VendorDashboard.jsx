import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Bell,
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
import { Progress } from '@/components/ui/progress';
import useAuthStore from '@/store/authStore';
import { useVendorStats, useVendorBookings, useVendorRating } from '@/hooks/useVendor';
import { formatDate, formatCurrency, getInitials } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function VendorDashboard() {
  const { profile } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useVendorStats();
  const { data: recentBookings, isLoading: bookingsLoading } = useVendorBookings();
  const { data: rating } = useVendorRating();

  const pendingBookings = recentBookings?.filter((b) => b.status === 'pending') || [];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="text-xl">
              {getInitials(profile?.name || 'Vendor')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {profile?.name?.split(' ')[0] || 'Vendor'}!
            </h1>
            <p className="text-muted-foreground">
              Manage your services and bookings
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/vendor/availability">
              <Calendar className="mr-2 h-4 w-4" />
              Set Availability
            </Link>
          </Button>
          <Button asChild>
            <Link to="/vendor/services/create">
              <Briefcase className="mr-2 h-4 w-4" />
              Add Service
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Bookings"
          value={stats?.totalBookings || 0}
          icon={Calendar}
          color="bg-blue-500"
          loading={statsLoading}
        />
        <StatsCard
          title="Pending Requests"
          value={stats?.pendingBookings || 0}
          icon={Clock}
          color="bg-yellow-500"
          loading={statsLoading}
        />
        <StatsCard
          title="Completed"
          value={stats?.completedBookings || 0}
          icon={CheckCircle}
          color="bg-green-500"
          loading={statsLoading}
        />
        <StatsCard
          title="Total Earnings"
          value={formatCurrency(stats?.totalEarnings || 0)}
          icon={DollarSign}
          color="bg-purple-500"
          loading={statsLoading}
          isAmount
        />
      </div>

      {/* Rating Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                <span className="text-4xl font-bold">{rating?.average || '0.0'}</span>
              </div>
              <div>
                <p className="font-medium">Your Rating</p>
                <p className="text-sm text-muted-foreground">
                  Based on {rating?.count || 0} reviews
                </p>
              </div>
            </div>
            <Button variant="outline" asChild>
              <Link to="/vendor/reviews">View All Reviews</Link>
            </Button>
          </div>
          {rating?.count > 0 && (
            <div className="mt-4">
              <Progress value={(rating.average / 5) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Booking Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Pending Requests
              </CardTitle>
              <CardDescription>
                Booking requests awaiting your response
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/vendor/bookings?status=pending">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {bookingsLoading && <BookingsSkeleton />}

            {!bookingsLoading && pendingBookings.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-10 w-10 text-green-500 opacity-50" />
                <p className="mt-2 text-muted-foreground">
                  No pending requests. You're all caught up!
                </p>
              </div>
            )}

            {!bookingsLoading && pendingBookings.length > 0 && (
              <div className="space-y-4">
                {pendingBookings.slice(0, 3).map((booking) => (
                  <PendingBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <QuickActionButton
              icon={Briefcase}
              label="Manage Services"
              description="Add, edit, or remove your services"
              to="/vendor/services"
            />
            <QuickActionButton
              icon={Calendar}
              label="View All Bookings"
              description="See all your booking history"
              to="/vendor/bookings"
            />
            <QuickActionButton
              icon={Clock}
              label="Update Availability"
              description="Set your available dates"
              to="/vendor/availability"
            />
            <QuickActionButton
              icon={Star}
              label="View Reviews"
              description="See what clients are saying"
              to="/vendor/reviews"
            />
          </CardContent>
        </Card>
      </div>

      {/* Tips for Vendors */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                Tips to Get More Bookings
              </h3>
              <ul className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                <li>• Keep your availability calendar up to date</li>
                <li>• Respond to booking requests within 24 hours</li>
                <li>• Add high-quality photos to your services</li>
                <li>• Ask satisfied clients to leave reviews</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, loading, isAmount = false }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className={`text-2xl font-bold ${isAmount ? 'text-green-600' : ''}`}>
                {value}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PendingBookingCard({ booking }) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border bg-yellow-50/50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={booking.organizer?.avatar_url} />
          <AvatarFallback>
            {getInitials(booking.organizer?.name || 'O')}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{booking.organizer?.name || 'Organizer'}</p>
          <p className="text-sm text-muted-foreground">
            {booking.event?.title || 'Event'} • {formatDate(booking.event?.date)}
          </p>
          <Badge variant="outline" className="mt-1 text-xs">
            {booking.service?.name || 'Service'}
          </Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-600">
          <XCircle className="h-4 w-4" />
        </Button>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, label, description, to }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted transition-colors"
    >
      <div className="rounded-full bg-primary/10 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4 rounded-lg border">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export default VendorDashboard;