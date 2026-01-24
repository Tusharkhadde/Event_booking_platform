import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  Star,
  ArrowRight,
  Heart,
  PartyPopper,
  Music,
  Briefcase,
  UserCheck,
  Building2,
  Sparkles,
  CheckCircle,
  Play,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { formatDate, getStatusColor } from '@/utils/helpers';
import useAuthStore from '@/store/authStore';
import EmptyState from '@/components/common/EmptyState';

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, profile } = useAuthStore();
  const { data: featuredEvents, isLoading } = useFeaturedEvents(6);
  const [showRoleDialog, setShowRoleDialog] = useState(false);

  const getDashboardLink = () => {
    const role = profile?.role;
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'organizer') return '/organizer/dashboard';
    if (role === 'vendor') return '/vendor/dashboard';
    return '/dashboard';
  };

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate(getDashboardLink());
    } else {
      setShowRoleDialog(true);
    }
  };

  const roleOptions = [
    {
      id: 'customer',
      title: 'Attend Events',
      subtitle: 'I want to discover and book events',
      icon: UserCheck,
      color: 'bg-blue-500',
      features: [
        'Browse all public events',
        'Book tickets for events',
        'RSVP to private invitations',
        'Save favorite events',
        'Manage your bookings',
      ],
    },
    {
      id: 'organizer',
      title: 'Organize Events',
      subtitle: 'I want to create and manage events',
      icon: Calendar,
      color: 'bg-purple-500',
      features: [
        'Create unlimited events',
        'Set custom ticket pricing',
        'Manage guest lists & RSVPs',
        'Hire and manage vendors',
        'Full event analytics',
      ],
    },
    {
      id: 'vendor',
      title: 'Offer Services',
      subtitle: 'I provide event services',
      icon: Building2,
      color: 'bg-green-500',
      features: [
        'List your services',
        'Receive booking requests',
        'Manage availability',
        'Get paid for services',
        'Build your reputation',
      ],
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-4 px-4 py-1" variant="secondary">
              <Sparkles className="mr-1 h-3 w-3" />
              Your Complete Event Solution
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Plan Perfect Events with{' '}
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                EventSphere
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
              Whether you're attending a concert, organizing a wedding, or offering catering services - 
              EventSphere brings everyone together in one powerful platform.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8">
                {isAuthenticated ? (
                  <>
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </>
                ) : (
                  <>
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <Link to="/events">
                  <Play className="mr-2 h-5 w-5" />
                  Explore Events
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute top-40 right-1/4 h-24 w-24 rounded-full bg-pink-500/20 blur-3xl" />
      </section>

      {/* Role Section - ONLY SHOW IF NOT LOGGED IN */}
      {!isAuthenticated && (
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Who is EventSphere For?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose your path and unlock features designed specifically for you
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                return (
                  <Card
                    key={role.id}
                    className="relative overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => navigate(`/register?role=${role.id}`)}
                  >
                    <div className={`absolute top-0 left-0 right-0 h-1 ${role.color}`} />
                    <CardHeader className="text-center pb-2">
                      <div
                        className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${role.color} text-white transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-xl">{role.title}</CardTitle>
                      <CardDescription>{role.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {role.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" variant="outline">
                        Get Started as {role.title.split(' ')[0]}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="border-y bg-background py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard number="10,000+" label="Events Hosted" icon={Calendar} />
            <StatCard number="50,000+" label="Happy Attendees" icon={Users} />
            <StatCard number="500+" label="Verified Vendors" icon={Building2} />
            <StatCard number="98%" label="Satisfaction Rate" icon={Star} />
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Perfect for Every Occasion</h2>
            <p className="text-muted-foreground">
              From intimate gatherings to grand celebrations
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <EventTypeCard
              icon={Heart}
              title="Weddings"
              description="Plan your perfect day"
              color="bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-400"
            />
            <EventTypeCard
              icon={PartyPopper}
              title="Parties"
              description="Birthday, Anniversary & more"
              color="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
            />
            <EventTypeCard
              icon={Music}
              title="Concerts"
              description="Live music experiences"
              color="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
            />
            <EventTypeCard
              icon={Briefcase}
              title="Corporate"
              description="Conferences & meetings"
              color="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
            />
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Upcoming Events</h2>
              <p className="text-muted-foreground">
                Discover amazing events happening near you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading && <EventsGridSkeleton />}

          {!isLoading && featuredEvents?.length === 0 && (
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="Be the first to create an event!"
            />
          )}

          {!isLoading && featuredEvents?.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Organizer Features - ONLY SHOW IF NOT LOGGED IN */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <Badge className="mb-4" variant="secondary">
                  For Event Organizers
                </Badge>
                <h2 className="text-3xl font-bold mb-4">
                  Full Control Over Your Events
                </h2>
                <p className="text-muted-foreground mb-6">
                  As an organizer, you have complete control over every aspect of your event - 
                  from setting ticket prices to managing vendors and guest lists.
                </p>
                <ul className="space-y-4">
                  <FeatureItem
                    title="Custom Ticket Pricing"
                    description="Set different prices for Normal, VIP, and VVIP tickets"
                  />
                  <FeatureItem
                    title="Guest Management"
                    description="Invite guests, track RSVPs, and manage seating"
                  />
                  <FeatureItem
                    title="Vendor Hiring"
                    description="Browse and hire caterers, decorators, photographers & more"
                  />
                  <FeatureItem
                    title="Private Events"
                    description="Create invitation-only events for weddings & family functions"
                  />
                </ul>
                <Button className="mt-6" asChild>
                  <Link to="/register?role=organizer">
                    Start Organizing
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 p-8">
                  <div className="h-full w-full rounded-xl bg-background shadow-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Wedding Reception</p>
                        <p className="text-sm text-muted-foreground">Private Event</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>Normal Guest</span>
                        <span className="font-bold text-green-600">$50</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>VIP Guest</span>
                        <span className="font-bold text-blue-600">$150</span>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg">
                        <span>VVIP Guest</span>
                        <span className="font-bold text-purple-600">$300</span>
                      </div>
                    </div>
                    <Badge className="w-full justify-center py-2">
                      Only You Control Pricing
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Show only if not logged in */}
      {!isAuthenticated && (
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="container text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Ready to Create Amazing Events?
            </h2>
            <p className="mb-8 text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of organizers, attendees, and vendors who trust EventSphere
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={handleGetStarted}
                className="text-lg"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                asChild
              >
                <Link to="/events">Explore Events</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Role Selection Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              How do you want to use EventSphere?
            </DialogTitle>
            <DialogDescription className="text-center">
              Choose your primary role to get started
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3 py-4">
            {roleOptions.map((role) => {
              const Icon = role.icon;
              return (
                <Card
                  key={role.id}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => {
                    setShowRoleDialog(false);
                    navigate(`/register?role=${role.id}`);
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${role.color} text-white`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-semibold mb-1">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">{role.subtitle}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary hover:underline"
              onClick={() => setShowRoleDialog(false)}
            >
              Log in
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components... (Keeping other existing sub-components the same)
function StatCard({ number, label, icon: Icon }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className="h-6 w-6 text-primary" />
        <span className="text-3xl font-bold md:text-4xl">{number}</span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function EventTypeCard({ icon: Icon, title, description, color }) {
  return (
    <Link to={`/events?category=${title.toLowerCase()}`}>
      <Card className="hover:shadow-md transition-all cursor-pointer group">
        <CardContent className="p-6 text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${color} transition-transform group-hover:scale-110`}
          >
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function FeatureItem({ title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 rounded-full bg-green-100 p-1 dark:bg-green-900">
        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function EventCard({ event }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all group">
      <div className="aspect-video overflow-hidden bg-muted">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        )}
        {!event.banner_url && (
          <div className="flex h-full items-center justify-center">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="capitalize">
            {event.category}
          </Badge>
          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{event.title}</h3>
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function EventsGridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-20" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="mb-2 h-6 w-3/4" />
            <Skeleton className="mb-1 h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default HomePage;