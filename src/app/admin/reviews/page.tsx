'use client';

import { usePendingReviews, useModerateReview } from '@/hooks/use-admin';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Star, CheckCircle, XCircle } from 'lucide-react';

export default function AdminReviewsPage() {
  const { data: reviews, isLoading } = usePendingReviews();
  const moderate = useModerateReview();

  const handleModerate = (id: string, approved: boolean) => {
    moderate.mutate({ id, isModerated: approved });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const reviewList = reviews ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reviews</h1>
        <p className="text-muted-foreground text-sm">Moderate customer reviews before they go live.</p>
      </div>

      {reviewList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Star className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No reviews pending moderation.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviewList.map((review: any) => (
            <Card key={review.id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{review.user?.username}</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < review.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {review.bundle && (
                  <p className="text-xs text-muted-foreground">
                    Bundle: {review.bundle.name}
                  </p>
                )}

                <p className="text-sm leading-relaxed">{review.comment}</p>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleModerate(review.id, true)}
                    disabled={moderate.isPending}
                    className="flex-1"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => handleModerate(review.id, false)}
                    disabled={moderate.isPending}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
