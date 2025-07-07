
import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
  variant?: "default" | "income" | "expense" | "receivable" | "due";
  className?: string;
}

export default function StatCard({
  title,
  value,
  change,
  icon,
  variant = "default",
  className,
}: StatCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "income":
        return "border-l-4 border-l-rare-green-500";
      case "expense":
        return "border-l-4 border-l-rare-red-500";
      case "receivable":
        return "border-l-4 border-l-rare-yellow-500";
      case "due":
        return "border-l-4 border-l-rare-red-500";
      default:
        return "border-l-4 border-l-rare-blue-500";
    }
  };
  
  return (
    <div className={cn("stat-card", getVariantClasses(), className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold">{value}</p>
        {change && (
          <div className="mt-1 flex items-center text-xs">
            {change.isPositive ? (
              <ArrowUp className="mr-1 h-3 w-3 text-rare-green-500" />
            ) : (
              <ArrowDown className="mr-1 h-3 w-3 text-rare-red-500" />
            )}
            <span
              className={cn(
                change.isPositive ? "text-rare-green-500" : "text-rare-red-500"
              )}
            >
              {change.value}%
            </span>
            <span className="ml-1 text-muted-foreground">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
