import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  X,
  Info,
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
import { cn } from '@/utils/cn';
import { toast } from '@/hooks/useToast';

function VendorAvailabilityPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Get days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Navigate months
  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Toggle availability for a date
  const toggleDate = (day) => {
    if (!day) return;

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(year, month, day);

    // Don't allow toggling past dates
    if (selectedDate < today) {
      toast({
        title: 'Cannot modify past dates',
        description: 'You can only set availability for today and future dates.',
        variant: 'destructive',
      });
      return;
    }

    setAvailability((prev) => ({
      ...prev,
      [dateKey]: prev[dateKey] === 'unavailable' ? 'available' : 'unavailable',
    }));
  };

  // Get availability status for a date
  const getDateStatus = (day) => {
    if (!day) return null;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return availability[dateKey] || 'available';
  };

  // Check if date is past
  const isPastDate = (day) => {
    if (!day) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(year, month, day);
    return selectedDate < today;
  };

  // Check if date is today
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    );
  };

  // Save availability
  const handleSave = async () => {
    setIsSaving(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Availability Saved',
      description: 'Your availability has been updated.',
      variant: 'success',
    });

    setIsSaving(false);
  };

  // Mark all days in month as unavailable
  const markMonthUnavailable = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newAvailability = { ...availability };

    for (let day = 1; day <= daysInMonth; day++) {
      const selectedDate = new Date(year, month, day);
      if (selectedDate >= today) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        newAvailability[dateKey] = 'unavailable';
      }
    }

    setAvailability(newAvailability);
  };

  // Mark all days in month as available
  const markMonthAvailable = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newAvailability = { ...availability };

    for (let day = 1; day <= daysInMonth; day++) {
      const selectedDate = new Date(year, month, day);
      if (selectedDate >= today) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        delete newAvailability[dateKey];
      }
    }

    setAvailability(newAvailability);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Count availability stats
  const unavailableDays = Object.values(availability).filter(
    (v) => v === 'unavailable'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Availability Calendar</h1>
          <p className="text-muted-foreground">
            Set your available dates for bookings
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">How to set your availability:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Click on any date to toggle between available and unavailable</li>
                <li>Green dates are available for bookings</li>
                <li>Red dates are marked as unavailable</li>
                <li>Past dates cannot be modified</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="outline" size="icon" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-xl">
                {monthName} {year}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const status = getDateStatus(day);
                const past = isPastDate(day);
                const today = isToday(day);

                return (
                  <div
                    key={index}
                    className={cn(
                      'aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all',
                      !day && 'invisible',
                      day && !past && 'cursor-pointer hover:ring-2 hover:ring-primary',
                      day && past && 'opacity-40 cursor-not-allowed',
                      day && status === 'available' && !past && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                      day && status === 'unavailable' && !past && 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                      today && 'ring-2 ring-primary'
                    )}
                    onClick={() => toggleDate(day)}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <X className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm">Unavailable</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-muted opacity-50"></div>
                <span className="text-sm">Past Date</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={markMonthAvailable}
              >
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Mark All Available
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={markMonthUnavailable}
              >
                <X className="mr-2 h-4 w-4 text-red-600" />
                Mark All Unavailable
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Unavailable Days
                  </span>
                  <Badge variant="secondary">{unavailableDays}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Days
                  </span>
                  <Badge variant="outline">{daysInMonth}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default VendorAvailabilityPage;