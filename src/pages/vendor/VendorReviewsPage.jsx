import { Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendorReviews, useVendorRatingSummary } from '@/hooks/useVendorReviews';
import useAuthStore from '@/store/authStore';
import { formatDate } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function VendorReviewsPage() {
  const { profile } = useAuthStore();
  const { data: reviews, isLoading } = useVendorReviews(profile?.id);
  const { data: summary } = useVendorRatingSummary(profile?.id);

  if (isLoading) {
    return <ReviewsSkeleton />;
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        icon={Star}
        title="No reviews yet"
        description="You haven't received any reviews yet. Complete some events to get feedback!"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Average Rating"
          value={summary?.average || 0}
          suffix="/ 5.0"
          color="text-yellow-600"
        />
        <StatCard
          label="Total Reviews"
          value={summary?.count || 0}
          color="text-blue-600"
        />
        <StatCard
          label="5 Star Reviews"
          value={reviews.filter((r) => r.rating === 5).length}
          color="text-green-600"
        />
        <StatCard
          label="Below 4 Stars"
          value={reviews.filter((r) => r.rating < 4).length}
          color="text-red-600"
        />
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Feedback</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer?.avatar_url} />
                    <AvatarFallback>
                      {review.reviewer?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {review.reviewer?.name || 'Anonymous'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, idx) => {
                    const filled = idx < review.rating;
                    return (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          filled
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-muted-foreground mt-2 pl-14">
                  "{review.comment}"
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, suffix = '', color }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {value}
            {suffix}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default VendorReviewsPage;