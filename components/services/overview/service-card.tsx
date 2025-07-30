'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Service } from '@/types';
import {
  Database,
  Table,
  MessageSquare,
  Zap,
  Key,
  Activity,
  Shield,
  LucideIcon,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, LucideIcon> = {
  Database,
  Table,
  MessageSquare,
  Zap,
  Key,
  Activity,
  Shield,
};

const statusVariant = {
  running: 'default' as const,
  stopped: 'secondary' as const,
  error: 'destructive' as const,
  unknown: 'outline' as const,
};

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = iconMap[service.icon] || Database;

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Icon className="h-8 w-8 text-muted-foreground" />
          <Badge variant={statusVariant[service.status]}>
            {service.status}
          </Badge>
        </div>
        <CardTitle className="mt-2">{service.displayName}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {service.enabled ? (
          <Link href={`/services/${service.id}`}>
            <Button className="w-full" variant="outline" size="sm">
              Manage
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Badge variant="secondary" className="w-full justify-center py-1">
            Coming Soon
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}