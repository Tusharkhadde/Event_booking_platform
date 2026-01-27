// src/pages/organizer/OrganizerCalendarPage.jsx
import { useState } from 'react';
import { useOrganizerCalendar } from '@/hooks/useCalendar';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ArrowLeft,
  ArrowRight,
  Clock,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { formatDate } from '@/utils/helpers';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function OrganizerCalendarPage() {
  const navigate = useNavigate();
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0–11

  const { data, isLoading } = useOrganizerCalendar();
  const events = data?.events || [];
  const tasks = data?.tasks || [];

  const monthStart = new Date(currentYear, currentMonth, 1);
  const monthEnd = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const firstDayIndex = monthStart.getDay();

  const calendarDays = buildCalendarDays(firstDayIndex, daysInMonth);

  const handlePrevMonth = () => {
    const prevMonth = currentMonth - 1;
    if (prevMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
      return;
    }
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = currentMonth + 1;
    if (nextMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
      return;
    }
    setCurrentMonth(nextMonth);
  };

  const monthYearLabel = buildMonthYearLabel(currentYear, currentMonth);

  const eventsByDay = groupEventsByDay(events, currentYear, currentMonth);
  const tasksByDay = groupTasksByDay(tasks, currentYear, currentMonth);
  const upcomingTasks = getUpcomingTasks(tasks);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Calendar & Scheduling</h1>
            <p className="text-muted-foreground text-sm">
              View your events and tasks on a monthly calendar
            </p>
          </div>
        </div>
      </div>

      {/* Calendar & Tasks */}
      {isLoading && <CalendarSkeleton />}

      {!isLoading && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Calendar</CardTitle>
                <CardDescription>Events & tasks this month</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{monthYearLabel}</span>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="h-8 flex items-center justify-center text-xs font-semibold text-muted-foreground"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isEmpty = day === null;
                  if (isEmpty) {
                    return <div key={index} className="h-20 border bg-muted/40" />;
                  }

                  const dateKey = buildDateKey(currentYear, currentMonth, day);
                  const dayEvents = eventsByDay[dateKey] || [];
                  const dayTasks = tasksByDay[dateKey] || [];

                  const isToday = checkIsToday(currentYear, currentMonth, day);

                  const dayClass = getDayCellClass(isToday);

                  return (
                    <div key={index} className={dayClass}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{day}</span>
                        {isToday && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 leading-none"
                          >
                            Today
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.map((ev) => (
                          <button
                            key={ev.id}
                            type="button"
                            className="w-full rounded bg-primary/10 text-primary text-[10px] px-1 py-0.5 text-left truncate"
                            onClick={() => navigate(`/organizer/events/edit/${ev.id}`)}
                          >
                            {ev.title}
                          </button>
                        ))}
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="w-full rounded bg-muted text-[9px] px-1 py-0.5 truncate flex items-center gap-1"
                          >
                            <ClipboardList className="h-3 w-3 text-muted-foreground" />
                            <span>{task.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming tasks */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">Upcoming Tasks</CardTitle>
              <CardDescription>Based on your task due dates</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 && (
                <EmptyState
                  icon={ClipboardList}
                  title="No upcoming tasks"
                  description="Add tasks to your events to see them here."
                />
              )}

              {upcomingTasks.length > 0 && (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-2 rounded-lg border bg-muted/40 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px]">
                          {task.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 leading-none capitalize"
                        >
                          {task.status}
                        </Badge>
                      </div>
                      {task.event && (
                        <p className="text-[10px] text-muted-foreground">
                          {task.event.title}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Due {formatDate(task.due_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function buildCalendarDays(firstDayIndex, daysInMonth) {
  const days = [];

  let i = 0;
  while (i < firstDayIndex) {
    days.push(null);
    i += 1;
  }

  let day = 1;
  while (day <= daysInMonth) {
    days.push(day);
    day += 1;
  }

  return days;
}

function buildMonthYearLabel(year, monthIndex) {
  const date = new Date(year, monthIndex, 1);
  const monthName = date.toLocaleString('default', { month: 'long' });
  return `${monthName} ${year}`;
}

function buildDateKey(year, monthIndex, day) {
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function checkIsToday(year, monthIndex, day) {
  const today = new Date();
  if (year !== today.getFullYear()) {
    return false;
  }
  if (monthIndex !== today.getMonth()) {
    return false;
  }
  if (day !== today.getDate()) {
    return false;
  }
  return true;
}

function getDayCellClass(isToday) {
  const base =
    'h-20 border p-1 flex flex-col justify-start bg-background';

  if (isToday) {
    return `${base} border-primary/70`;
  }

  return `${base}`;
}

function groupEventsByDay(events, year, monthIndex) {
  const map = {};
  events.forEach((e) => {
    if (!e.date) return;
    const date = new Date(e.date);
    if (date.getFullYear() !== year) return;
    if (date.getMonth() !== monthIndex) return;

    const day = date.getDate();
    const key = buildDateKey(year, monthIndex, day);
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(e);
  });
  return map;
}

function groupTasksByDay(tasks, year, monthIndex) {
  const map = {};
  tasks.forEach((t) => {
    if (!t.due_date) return;
    const date = new Date(t.due_date);
    if (date.getFullYear() !== year) return;
    if (date.getMonth() !== monthIndex) return;

    const day = date.getDate();
    const key = buildDateKey(year, monthIndex, day);
    if (!map[key]) {
      map[key] = [];
    }
    map[key].push(t);
  });
  return map;
}

function getUpcomingTasks(tasks) {
  if (!tasks || tasks.length === 0) return [];
  const now = new Date();
  const futureTasks = tasks.filter((t) => {
    if (!t.due_date) return false;
    const d = new Date(t.due_date);
    return d >= now;
  });

  futureTasks.sort((a, b) => {
    const aDate = new Date(a.due_date);
    const bDate = new Date(b.due_date);
    return aDate - bDate;
  });

  return futureTasks.slice(0, 10);
}

function CalendarSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <Skeleton className="h-64 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default OrganizerCalendarPage;