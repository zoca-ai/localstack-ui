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
    <aside className={cn('w-56 border-r bg-muted/30', className)}>
      <ScrollArea className="h-full">
        <div className="flex h-16 items-center border-b px-6">
          <h2 className="text-lg font-semibold">LocalStack</h2>
        </div>
        <div className="space-y-1 p-3">
          <Link href="/">
            <div
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                pathname === '/' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              <Home className="h-4 w-4" />
              <span>Overview</span>
            </div>
          </Link>
          
          <div className="my-3 h-px bg-border" />
          
          <div className="space-y-1">
            {AVAILABLE_SERVICES.filter(service => service.enabled).map((service) => {
              const Icon = iconMap[service.icon] || Database;
              const isActive = pathname === `/services/${service.id}`;
              
              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                >
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{service.displayName}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          
          {AVAILABLE_SERVICES.some(service => !service.enabled) && (
            <>
              <div className="my-3 h-px bg-border" />
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground">Coming Soon</p>
              </div>
              <div className="space-y-1">
                {AVAILABLE_SERVICES.filter(service => !service.enabled).map((service) => {
                  const Icon = iconMap[service.icon] || Database;
                  
                  return (
                    <div
                      key={service.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{service.displayName}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}