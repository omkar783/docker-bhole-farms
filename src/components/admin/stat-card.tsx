"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <p className={cn("text-xs font-medium", trend.positive ? "text-emerald-600" : "text-red-600")}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
