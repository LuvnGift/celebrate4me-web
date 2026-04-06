'use client';

import { useOccasions } from '@/hooks/use-occasions';
import { OccasionCard } from '@/components/occasions/occasion-card';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';

export function OccasionsClientPage() {
  const { data: occasions, isLoading, isError } = useOccasions();

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tight mb-3">Send a gift to Nigeria</h1>
        <p className="text-muted-foreground text-lg mb-6">
          Choose an occasion below to explore curated bundles, or build a custom gift from scratch.
        </p>
        <Button asChild size="lg">
          <Link href="/custom">
            <Wand2 className="h-4 w-4 mr-2" />
            Build a custom gift
          </Link>
        </Button>
      </div>

      {/* Occasions grid */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-muted-foreground">
          <p>Unable to load occasions. Please try again later.</p>
        </div>
      )}

      {occasions && occasions.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>No occasions available yet. Check back soon!</p>
        </div>
      )}

      {occasions && occasions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {occasions.filter((o) => o.isActive).map((occasion) => (
            <OccasionCard key={occasion.id} occasion={occasion} />
          ))}
        </div>
      )}
    </div>
  );
}
