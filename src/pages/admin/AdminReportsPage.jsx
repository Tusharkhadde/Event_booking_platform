import { useAdminStats } from '@/hooks/useAdmin';
import { useAdminAnalytics } from '@/hooks/useAnalytics';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Calendar, Shield, Activity } from 'lucide-react';

const CATEGORY_LABELS = {
  wedding: 'Wedding',
  party: 'Party',
  concert: 'Concert',
  conference: 'Conference',
  corporate: 'Corporate',
  birthday: 'Birthday',
  anniversary: 'Anniversary',
  other: 'Other',
};

function AdminReportsPage() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();

  const loading = statsLoading || analyticsLoading;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-muted-foreground">
          Overview of platform activity and performance
        </p>
      </div>

      {/* Top Stats */}
      {loading && <TopStatsSkeleton />}

      {!loading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            colorClass="text-blue-600"
          />
          <StatCard
            icon={Calendar}
            label="Total Events"
            value={stats.totalEvents}
            colorClass="text-green-600"
          />
          <StatCard
            icon={Shield}
            label="Vendors"
            value={stats.totalVendors}
            colorClass="text-purple-600"
          />
          <StatCard
            icon={Activity}
            label="Pending Vendors"
            value={stats.pendingVendors}
            colorClass="text-amber-600"
          />
        </div>
      )}

      {/* Charts */}
      {loading && <ChartsSkeleton />}

      {!loading && analytics && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Events by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Events by Category</CardTitle>
              <CardDescription>
                Distribution of events across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart data={analytics.eventsByCategory} labels={CATEGORY_LABELS} />
            </CardContent>
          </Card>

          {/* Users by Role */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Users by Role</CardTitle>
              <CardDescription>Admin, Organizer, Vendor, Customer</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={analytics.usersByRole}
                labels={{
                  admin: 'Admins',
                  organizer: 'Organizers',
                  vendor: 'Vendors',
                  customer: 'Customers',
                }}
              />
            </CardContent>
          </Card>

          {/* Events by Status */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Events by Status</CardTitle>
              <CardDescription>Upcoming, Live, Completed, Cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={analytics.eventsByStatus}
                labels={{
                  upcoming: 'Upcoming',
                  live: 'Live',
                  completed: 'Completed',
                  cancelled: 'Cancelled',
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
        </div>
        <div className="p-3 rounded-full bg-muted">
          <Icon className={`h-5 w-5 ${colorClass}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function BarChart({ data, labels }) {
  const entries = Object.entries(data || {});
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No data available</p>;
  }

  // compute max value
  let max = 0;
  entries.forEach(([_, value]) => {
    if (value > max) {
      max = value;
    }
  });

  const rows = entries.map(([key, value]) => {
    const label = labels && labels[key] ? labels[key] : key;
    const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

    return (
      <div key={key} className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">{value}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-2 bg-primary"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  });

  return <div className="space-y-3">{rows}</div>;
}

function TopStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-64 w-full lg:col-span-2" />
    </div>
  );
}

export default AdminReportsPage;