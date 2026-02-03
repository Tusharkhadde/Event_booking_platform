import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Calendar,
  MapPin,
  Clock,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Grid,
  List,
  Ticket,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, formatCurrency, getStatusColor } from '@/utils/helpers';
import { EVENT_CATEGORIES } from '@/utils/constants';
import EmptyState from '@/components/common/EmptyState';
import { toast } from '@/hooks/useToast';

function SavedEventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - In real app, fetch from Supabase using useSavedEvents hook
  const [savedEvents, setSavedEvents] = useState([
    {
      id: '1',
      title: 'Summer Music Festival 2024',
      description: 'The biggest music festival of the summer featuring top artists from around the world.',
      date: '2024-07-15',
      time: '18:00',
      location: 'Central Park, New York',
      category: 'concert',
      status: 'upcoming',
      banner_url: null,
      price_from: 50,
      saved_at: '2024-06-10',
    },
    {
      id: '2',
      title: 'Tech Innovation Conference',
      description: 'Join industry leaders and innovators for a day of insights and networking.',
      date: '2024-08-20',
      time: '09:00',
      location: 'Convention Center, San Francisco',
      category: 'conference',
      status: 'upcoming',
      banner_url: null,
      price_from: 150,
      saved_at: '2024-06-08',
    },
    {
      id: '3',
      title: 'Jazz Night Live',
      description: 'An evening of smooth jazz with renowned musicians.',
      date: '2024-08-10',
      time: '20:00',
      location: 'Blue Note Jazz Club',
      category: 'concert',
      status: 'upcoming',
      banner_url: null,
      price_from: 45,
      saved_at: '2024-06-05',
    },
    {
      id: '4',
      title: 'Food & Wine Festival',
      description: 'Taste the finest cuisines and wines from local and international vendors.',
      date: '2024-09-05',
      time: '12:00',
      location: 'Riverside Park',
      category: 'other',
      status: 'upcoming',
      banner_url: null,
      price_from: 75,
      saved_at: '2024-06-01',
    },
  ]);

  // Filter events
  const filteredEvents = savedEvents.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleRemoveSaved = (eventId) => {
    setSavedEvents((prev) => prev.filter((e) => e.id !== eventId));
    toast({
      title: 'Removed from Saved',
      description: 'Event has been removed from your saved list.',
    });
  };

  const handleClearAll = () => {
    setSavedEvents([]);
    toast({
      title: 'Cleared All',
      description: 'All saved events have been removed.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            Saved Events
          </h1>
          <p className="text-muted-foreground">
            Events you've saved for later ({savedEvents.length} total)
          </p>
        </div>
        {savedEvents.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all saved events?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all {savedEvents.length} events from your saved list. 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground">
                  Clear All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Filters */}
      {savedEvents.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search saved events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && <SavedEventsSkeleton viewMode={viewMode} />}

      {/* Empty State */}
      {!isLoading && savedEvents.length === 0 && (
        <Card className="py-16">
          <CardContent>
            <EmptyState
              icon={Heart}
              title="No saved events yet"
              description="When you find events you're interested in, save them here for easy access later."
              action={() => {}}
              actionLabel="Browse Events"
            />
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {!isLoading && savedEvents.length > 0 && filteredEvents.length === 0 && (
        <Card className="py-12">
          <CardContent className="text-center">
            <Search className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-semibold">No matching events</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Events Grid/List */}
      {!isLoading && filteredEvents.length > 0 && (
        <>
          {viewMode === 'grid' && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <SavedEventGridCard
                  key={event.id}
                  event={event}
                  onRemove={() => handleRemoveSaved(event.id)}
                />
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <SavedEventListCard
                  key={event.id}
                  event={event}
                  onRemove={() => handleRemoveSaved(event.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Quick Stats */}
      {savedEvents.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{savedEvents.length}</p>
                <p className="text-sm text-muted-foreground">Total Saved</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {savedEvents.filter((e) => e.status === 'upcoming').length}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming Events</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(Math.min(...savedEvents.map((e) => e.price_from)))}
                </p>
                <p className="text-sm text-muted-foreground">Lowest Price</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Grid Card Component
function SavedEventGridCard({ event, onRemove }) {
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {event.banner_url && (
          <img
            src={event.banner_url}
            alt={event.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        )}
        {!event.banner_url && (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
            <Calendar className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Remove Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
        >
          <Heart className="h-4 w-4 fill-current" />
        </Button>

        {/* Price Badge */}
        <div className="absolute bottom-2 left-2">
          <Badge className="bg-background/90 text-foreground">
            From {formatCurrency(event.price_from)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="capitalize">
            {event.category}
          </Badge>
          <Badge className={getStatusColor(event.status)}>
            {event.status}
          </Badge>
        </div>
        <CardTitle className="line-clamp-1 text-lg">{event.title}</CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.date)}</span>
            {event.time && (
              <>
                <Clock className="h-4 w-4 ml-2" />
                <span>{event.time}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button className="flex-1" asChild>
          <Link to={`/book/${event.id}`}>
            <Ticket className="mr-2 h-4 w-4" />
            Book Now
          </Link>
        </Button>
        <Button variant="outline" size="icon" asChild>
          <Link to={`/events/${event.id}`}>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

// List Card Component
function SavedEventListCard({ event, onRemove }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-all">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="relative aspect-video sm:aspect-square sm:w-48 overflow-hidden bg-muted flex-shrink-0">
            {event.banner_url && (
              <img
                src={event.banner_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            )}
            {!event.banner_url && (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-2 left-2">
              <Badge className="bg-background/90 text-foreground">
                From {formatCurrency(event.price_from)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex gap-2">
                <Badge variant="secondary" className="capitalize">
                  {event.category}
                </Badge>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground">
                Saved {formatDate(event.saved_at)}
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
            
            {event.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {event.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              {event.time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{event.location}</span>
              </div>
            </div>

            <div className="mt-auto flex items-center gap-2">
              <Button asChild>
                <Link to={`/book/${event.id}`}>
                  <AnimatedButton className="px-4 py-1.5 text-sm">
                    Book Now
                  </AnimatedButton>
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/events/${event.id}`}>
                  View Details
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Skeleton Loader
function SavedEventsSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                <Skeleton className="aspect-video sm:aspect-square sm:w-48" />
                <div className="flex-1 p-4 space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <Skeleton className="aspect-video" />
          <CardHeader className="pb-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent className="pb-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default SavedEventsPage;