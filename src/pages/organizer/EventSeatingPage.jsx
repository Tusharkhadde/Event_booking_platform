// src/pages/organizer/EventSeatingPage.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useEvent } from '@/hooks/useEvents';
import { useSeats, useGenerateSeatLayout, useToggleSeatAvailability } from '@/hooks/useSeats';
import {
  ArrowLeft,
  MapPin,
  Grid3X3,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';

function EventSeatingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);

  const venueId = event?.venue_id || null;
  const { data: seats, isLoading: seatsLoading } = useSeats(venueId);
  const generateLayoutMutation = useGenerateSeatLayout();
  const toggleSeatMutation = useToggleSeatAvailability();

  const [layout, setLayout] = useState({
    rowCount: '5',
    seatsPerRow: '10',
  });

  const loading = eventLoading || seatsLoading;

  const groupedSeats = useMemo(() => {
    const map = {};
    if (!seats) {
      return map;
    }
    seats.forEach((seat) => {
      const row = seat.row_label || '?';
      if (!map[row]) {
        map[row] = [];
      }
      map[row].push(seat);
    });
    Object.keys(map).forEach((row) => {
      map[row].sort((a, b) => {
        const aNum = Number(a.seat_number || 0);
        const bNum = Number(b.seat_number || 0);
        return aNum - bNum;
      });
    });
    return map;
  }, [seats]);

  const hasSeats = seats && seats.length > 0;

  const handleLayoutChange = (field, value) => {
    setLayout({ ...layout, [field]: value });
  };

  const handleGenerateLayout = () => {
    if (!venueId) {
      return;
    }
    const rowCount = Number(layout.rowCount || 0);
    const seatsPerRow = Number(layout.seatsPerRow || 0);
    if (rowCount <= 0 || seatsPerRow <= 0) {
      return;
    }
    generateLayoutMutation.mutate({
      venueId,
      rowCount,
      seatsPerRow,
    });
  };

  const handleSeatClick = (seat) => {
    const nextValue = !seat.is_available;
    toggleSeatMutation.mutate({
      seatId: seat.id,
      isAvailable: nextValue,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Grid3X3 className="h-5 w-5 text-primary" />
            Seating Layout
          </h1>
          {event && (
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              {event.title}
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {event.venue_name || 'No venue linked'}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && <SeatingSkeleton />}

      {/* No Venue State */}
      {!loading && !venueId && (
        <Card>
          <CardContent className="py-6">
            <EmptyState
              icon={MapPin}
              title="No venue linked to this event"
              description="To configure seating, please assign a venue to this event first."
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content - When venue exists */}
      {!loading && venueId && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Controls */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seat Layout</CardTitle>
                <CardDescription>
                  Generate rows and seats for this venue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-3 flex gap-2">
                  <Info className="h-4 w-4 text-blue-500 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-200">
                    Once generated, you can click individual seats to mark them
                    as available or unavailable. This can reflect reserved or blocked seats.
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Number of rows</Label>
                  <Input
                    type="number"
                    min="1"
                    value={layout.rowCount}
                    onChange={(e) => handleLayoutChange('rowCount', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Seats per row</Label>
                  <Input
                    type="number"
                    min="1"
                    value={layout.seatsPerRow}
                    onChange={(e) =>
                      handleLayoutChange('seatsPerRow', e.target.value)
                    }
                  />
                </div>
                <Button
                  className="mt-2 w-full"
                  onClick={handleGenerateLayout}
                  disabled={generateLayoutMutation.isPending}
                >
                  {generateLayoutMutation.isPending ? 'Generating...' : 'Generate Layout'}
                </Button>
              </CardContent>
            </Card>

            {/* Legend Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Legend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-green-500" />
                  <span>Available seat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded bg-red-500" />
                  <span>Unavailable / blocked seat</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seating Grid */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Seat Map</CardTitle>
              {hasSeats && (
                <CardDescription>
                  Click on a seat to toggle its availability
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {!hasSeats && (
                <EmptyState
                  icon={Grid3X3}
                  title="No seats generated yet"
                  description="Use the controls on the left to create a seating layout."
                />
              )}

              {hasSeats && (
                <div className="space-y-4 overflow-auto">
                  {/* Stage indicator */}
                  <div className="flex justify-center mb-6">
                    <div className="px-8 py-2 bg-muted rounded-lg text-sm font-medium text-muted-foreground">
                      STAGE
                    </div>
                  </div>

                  {/* Seat rows */}
                  {Object.keys(groupedSeats)
                    .sort()
                    .map((rowKey) => {
                      const rowSeats = groupedSeats[rowKey];
                      return (
                        <div key={rowKey} className="flex items-center gap-2">
                          <div className="w-6 text-xs font-semibold text-muted-foreground">
                            {rowKey}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {rowSeats.map((seat) => (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => handleSeatClick(seat)}
                                disabled={toggleSeatMutation.isPending}
                                className={`
                                  h-8 w-8 rounded text-[10px] font-semibold text-white 
                                  flex items-center justify-center
                                  transition-all duration-200 hover:scale-110 hover:shadow-md
                                  disabled:opacity-50 disabled:cursor-not-allowed
                                  ${seat.is_available 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : 'bg-red-500 hover:bg-red-600'
                                  }
                                `}
                                title={`Row ${seat.row_label}, Seat ${seat.seat_number} - ${
                                  seat.is_available ? 'Available' : 'Unavailable'
                                }`}
                              >
                                {seat.seat_number}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function SeatingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="lg:col-span-2">
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

export default EventSeatingPage;