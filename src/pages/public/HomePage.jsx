import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedEvents } from '@/hooks/useEvents';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';
import { EVENT_CATEGORIES } from '@/utils/constants';
import EmptyState from '@/components/common/EmptyState';

function HomePage() {
  const { data: featuredEvents, isLoading, error } = useFeaturedEvents(6);

  const categoryIcons = {
    wedding: Heart,
    party: PartyPopper,
    concert: Music,
    conference: Briefcase,
    corporate: Briefcase,
    birthday: PartyPopper,
    anniversary: Heart,
    other: Calendar,
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-32">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge className="mb-4" variant="secondary">
              🎉 Your Event Planning Partner
            </Badge>
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              Plan Your Perfect Event with{' '}
              <span className="text-primary">EventSphere</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              From weddings to corporate events, we help you create unforgettable
              experiences. Discover events, manage planning, and connect with top vendors.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link to="/events">
                  Browse Events
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Start Planning</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute left-10 top-20 h-20 w-20 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/50 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard number="10,000+" label="Events Hosted" />
            <StatCard number="50,000+" label="Happy Guests" />
            <StatCard number="500+" label="Trusted Vendors" />
            <StatCard number="98%" label="Satisfaction Rate" />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Browse by Category</h2>
            <p className="text-muted-foreground">
              Find the perfect event type for your celebration
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {EVENT_CATEGORIES.slice(0, 8).map((category) => {
              const Icon = categoryIcons[category.value] || Calendar;
              return (
                <Link
                  key={category.value}
                  to={`/events?category=${category.value}`}
                  className="group"
                >
                  <Card className="transition-all hover:border-primary hover:shadow-md">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="mb-4 rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold">{category.label}</h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="mb-2 text-3xl font-bold">Featured Events</h2>
              <p className="text-muted-foreground">
                Discover upcoming events near you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/events">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading && <EventsGridSkeleton />}

          {error && (
            <EmptyState
              icon={Calendar}
              title="Failed to load events"
              description="There was an error loading the events. Please try again."
            />
          )}

          {!isLoading && !error && featuredEvents?.length === 0 && (
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="Be the first to create an event!"
              action={() => {}}
              actionLabel="Create Event"
            />
          )}

          {!isLoading && !error && featuredEvents?.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Why Choose EventSphere?</h2>
            <p className="text-muted-foreground">
              Everything you need to plan and manage successful events
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={Calendar}
              title="Easy Event Management"
              description="Create, manage, and track all your events in one place with our intuitive dashboard."
            />
            <FeatureCard
              icon={Users}
              title="Guest Management"
              description="Manage guest lists, send invitations, and track RSVPs effortlessly."
            />
            <FeatureCard
              icon={Star}
              title="Top Vendors"
              description="Connect with verified vendors for catering, decoration, photography, and more."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground md:py-24">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Plan Your Event?</h2>
          <p className="mb-8 text-lg opacity-90">
            Join thousands of event organizers who trust EventSphere
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <Link to="/events">Explore Events</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Sub-components

function StatCard({ number, label }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary md:text-4xl">{number}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function EventCard({ event }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="aspect-video overflow-hidden bg-muted">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
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