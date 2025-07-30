'use client';

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ServicePageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  icon: LucideIcon;
  primaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  };
  stats?: Array<{
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    loading?: boolean;
  }>;
  alert?: {
    icon: LucideIcon;
    description: string;
  };
}

export function ServicePageLayout({
  children,
  title,
  description,
  icon: Icon,
  primaryAction,
  secondaryAction,
  stats,
  alert,
}: ServicePageLayoutProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {secondaryAction && (
            <Button 
              onClick={secondaryAction.onClick} 
              variant={secondaryAction.variant || "outline"}
              size="sm"
            >
              {secondaryAction.icon && <secondaryAction.icon className="mr-2 h-4 w-4" />}
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.icon && <primaryAction.icon className="mr-2 h-4 w-4" />}
              {primaryAction.label}
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      {stats && stats.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Alert */}
      {alert && (
        <Alert>
          <alert.icon className="h-4 w-4" />
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {children}
    </div>
  );
}