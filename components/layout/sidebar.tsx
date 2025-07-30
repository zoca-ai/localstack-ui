'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AVAILABLE_SERVICES } from '@/config/services';
import {
  Database,
  Table,
  MessageSquare,
  Zap,
  Key,
  Activity,
  Shield,
  Home,
  LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const iconMap: Record<string, LucideIcon> = {
  Database,
  Table,
  MessageSquare,
  Zap,
  Key,
  Activity,
  Shield,
};

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-64 border-r bg-background', className)}>
      <ScrollArea className="h-full">
        <div className="space-y-4 py-4">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold">LocalStack UI</h2>
            <div className="space-y-1">
              <Link href="/">
                <div
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                    pathname === '/' && 'bg-accent'
                  )}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Overview
                </div>
              </Link>
            </div>
          </div>
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Services
            </h2>
            <div className="space-y-1">
              {AVAILABLE_SERVICES.map((service) => {
                const Icon = iconMap[service.icon] || Database;
                const isActive = pathname === `/services/${service.id}`;
                
                return (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className={cn(
                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent',
                      !service.enabled && 'opacity-50'
                    )}
                  >
                    <div className="flex items-center">
                      <Icon className="mr-2 h-4 w-4" />
                      {service.displayName}
                    </div>
                    {!service.enabled && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}