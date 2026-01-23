import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  X,
  Grid,
  List,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEvents } from '@/hooks/useEvents';
import { formatDate, getStatusColor } from '@/utils/helpers';
import { EVENT_CATEGORIES, EVENT_STATUS } from '@/utils/constants';
import EmptyState from '@/components/common/EmptyState';

function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  
  // Get initial filter values from URL
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // Fetch events with filters
  const { data: events, isLoading, error } = useEvents({
    search: debouncedSearch,
    category: filters.category,
    status: filters.status,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (value) => {
    const newValue = value === 'all' ? '' : value;
    setFilters((prev) => ({ ...prev, category: newValue }));
  };

  const handleStatusChange = (value) => {
    const newValue = value === 'all' ? '' : value;
    setFilters((prev) => ({ ...prev, status: newValue }));
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', status: '' });
  };

  const hasActiveFilters = filters.search || filters.category || filters.status;

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Discover Events</h1>
        <p className="text-muted-foreground">
          Find and explore amazing events happening around you
        </p>
      </div>

      {/* Filters Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EVENT_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                />
              </Badge>
            )}
            {filters.category && (
              <Badge variant="secondary" className="gap-1">
                Category: {filters.category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, category: '' }))}
                />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="gap-1">
                Status: {filters.status}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters((prev) => ({ ...prev, status: '' }))}
                />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Results Count */}
      {!isLoading && events && (
        <p className="mb-4 text-sm text-muted-foreground">
          Showing {events.length} event{events.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Loading State */}
      {isLoading && <EventsGridSkeleton viewMode={viewMode} />}

      {/* Error State */}
      {error && (
        <EmptyState
          icon={Calendar}
          title="Failed to load events"
          description="There was an error loading the events. Please try again."
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && events?.length === 0 && (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description={
            hasActiveFilters
              ? 'Try adjusting your filters to find more events.'
              : 'There are no events available at the moment.'
          }
          action={hasActiveFilters ? clearFilters : undefined}
          actionLabel={hasActiveFilters ? 'Clear Filters' : undefined}
        />
      )}

      {/* Events Grid/List */}
      {!isLoading && !error && events?.length > 0 && (
        <div>
          {viewMode === 'grid' && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventGridCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {viewMode === 'list' && (
            <div className="space-y-4">
              {events.map((event) => (
                <EventListCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Sub-components

function EventGridCard({ event }) {
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
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="capitalize">
            {event.category}
          </Badge>
          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <h3 className="mb-2 line-clamp-1 text-lg font-semibold">{event.title}</h3>
        {event.description && (
          <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
            {event.description}
          </p>
        )}
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

function EventListCard({ event }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="flex flex-col sm:flex-row">
        <div className="aspect-video w-full overflow-hidden bg-muted sm:aspect-square sm:w-48">
          {event.banner_url && (
            <img
              src={event.banner_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          )}
          {!event.banner_url && (
            <div className="flex h-full items-center justify-center">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div className="flex gap-2">
              <Badge variant="secondary" className="capitalize">
                {event.category}
              </Badge>
              <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
            </div>
          </div>
          <h3 className="mb-1 text-lg font-semibold">{event.title}</h3>
          {event.description && (
            <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
              {event.description}
            </p>
          )}
          <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
          <div className="mt-auto">
            <Button asChild>
              <Link to={`/events/${event.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EventsGridSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <Skeleton className="aspect-video w-full sm:aspect-square sm:w-48" />
              <div className="flex-1 p-4">
                <Skeleton className="mb-2 h-5 w-24" />
                <Skeleton className="mb-2 h-6 w-3/4" />
                <Skeleton className="mb-4 h-4 w-full" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

export default EventsPage;