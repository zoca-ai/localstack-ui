'use client';

import { ConnectionStatus } from '@/components/services/overview/connection-status';
import { ServiceCard } from '@/components/services/overview/service-card';
import { useLocalStackHealth } from '@/hooks/use-localstack';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverviewPage() {
  const { data: health, isLoading } = useLocalStackHealth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
        <p className="text-muted-foreground">
          Monitor and manage your LocalStack services
        </p>
      </div>

      <ConnectionStatus />

      <div>
        <h3 className="text-xl font-semibold mb-4">Available Services</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))
            : health?.services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
        </div>
      </div>
    </div>
  );
}