import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}) => {
  return (
    <Card
      className={cn(
        "p-6 h-full transition-shadow hover:shadow-lg bg-white dark:bg-zinc-900",
        "rounded-2xl",
        className
      )}
      aria-label={`Stat card for ${title}`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <h3 className="text-3xl font-bold mt-2 text-zinc-900 dark:text-zinc-100">
            {value}
          </h3>

          {trend && (
            <div className="flex items-center mt-1">
              <span
                className={cn(
                  "text-xs font-semibold",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? '+' : '-'}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground ml-2">vs last month</span>
            </div>
          )}

          {description && (
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          )}
        </div>

        {icon && (
          <div className="w-12 h-12 rounded-xl bg-diamond-100 dark:bg-diamond-950 flex items-center justify-center text-diamond-600 dark:text-diamond-300">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
