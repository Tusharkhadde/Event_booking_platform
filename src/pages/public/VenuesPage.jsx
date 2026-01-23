import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Search, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useVenues } from '@/hooks/useVenues';
import EmptyState from '@/components/common/EmptyState';

function VenuesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCity, setDebouncedCity] = useState('');

  // Debounce search inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setDebouncedCity(cityFilter);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, cityFilter]);

  const { data: venues, isLoading, error } = useVenues({
    search: debouncedSearch,
    city: debouncedCity,
  });

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Find the Perfect Venue</h1>
        <p className="text-muted-foreground">
          Browse our curated list of wedding halls, party venues, and conference centers.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter by city..."
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <VenuesSkeleton />}

      {/* Error State */}
      {error && !isLoading && (
        <EmptyState
          icon={Building}
          title="Failed to load venues"
          description="There was an error loading venues. Please try again."
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && venues?.length === 0 && (
        <EmptyState
          icon={Building}
          title="No venues found"
          description="Try adjusting your search filters or check back later."
        />
      )}

      {/* Venues Grid */}
      {!isLoading && !error && venues && venues.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

function VenueCard({ venue }) {
  const mainImage = venue.images && venue.images.length > 0 ? venue.images[0] : null;

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {mainImage && (
          <img
            src={mainImage}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        )}
        {!mainImage && (
          <div className="flex h-full items-center justify-center">
            <Building className="h-12 w-12 text-muted-foreground opacity-50" />
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {venue.price_range || '$$'}
          </Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <h3 className="line-clamp-1 text-lg font-bold">{venue.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">
            {venue.city}
            {venue.state && `, ${venue.state}`}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Up to {venue.capacity} guests</span>
          </div>
        </div>
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {venue.amenities.slice(0, 3).map((amenity, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {venue.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link to={`/venues/${venue.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function VenuesSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <Skeleton className="aspect-video" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-4 h-10 w-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default VenuesPage;