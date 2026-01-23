import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function AdminDashboard() {
  // Mock data - In real app, fetch from Supabase
  const stats = {
    totalUsers: 1250,
    usersChange: 12.5,
    totalEvents: 342,
    eventsChange: 8.2,
    totalRevenue: 45600,
    revenueChange: 15.3,
    activeVendors: 85,
    vendorsChange: -2.4,
  };

  const recentUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'organizer', createdAt: '2024-06-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'customer', createdAt: '2024-06-14' },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'vendor', createdAt: '2024-06-13' },
  ];

  const recentEvents = [
    { id: '1', title: 'Summer Festival', organizer: 'John Doe', status: 'upcoming', date: '2024-07-15' },
    { id: '2', title: 'Tech Conference', organizer: 'Jane Smith', status: 'live', date: '2024-06-20' },
    { id: '3', title: 'Wedding Celebration', organizer: 'Bob Wilson', status: 'completed', date: '2024-06-10' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your platform's performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change={stats.usersChange}
          icon={Users}
        />
        <StatsCard
          title="Total Events"
          value={stats.totalEvents.toLocaleString()}
          change={stats.eventsChange}
          icon={Calendar}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          change={stats.revenueChange}
          icon={CreditCard}
        />
        <StatsCard
          title="Active Vendors"
          value={stats.activeVendors.toLocaleString()}
          change={stats.vendorsChange}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>Latest registered users</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/users">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Suspend User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Latest created events</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/events">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      by {event.organizer}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        event.status === 'live'
                          ? 'default'
                          : event.status === 'upcoming'
                          ? 'secondary'
                          : 'outline'
                      }
                    >
                      {event.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Event</DropdownMenuItem>
                        <DropdownMenuItem>Edit Event</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Cancel Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon }) {
  const isPositive = change >= 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1 text-sm">
          {isPositive && (
            <>
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+{change}%</span>
            </>
          )}
          {!isPositive && (
            <>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              <span className="text-red-500">{change}%</span>
            </>
          )}
          <span className="text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminDashboard;