
import React from "react";
import { AlertTriangle, Bell, X, BellRing } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Alert = {
  id: string;
  title: string;
  description: string;
  type: "due" | "reminder" | "warning" | "info";
  date?: string;
};

interface AlertCardProps {
  title: string;
  alerts: Alert[];
  className?: string;
}

export default function AlertCard({ title, alerts, className }: AlertCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4 shadow-sm", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BellRing className="h-5 w-5 text-rare-yellow-500" />
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {alerts.length > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rare-yellow-500 text-xs font-medium text-white">
            {alerts.length}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div 
              key={alert.id}
              className={cn(
                "flex items-start justify-between rounded-md border p-3",
                alert.type === "due" && "border-l-4 border-l-rare-red-500",
                alert.type === "warning" && "border-l-4 border-l-rare-yellow-500",
                alert.type === "reminder" && "border-l-4 border-l-rare-blue-500",
                alert.type === "info" && "border-l-4 border-l-rare-green-500"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <AlertTriangle 
                    className={cn(
                      "h-4 w-4",
                      alert.type === "due" && "text-rare-red-500",
                      alert.type === "warning" && "text-rare-yellow-500",
                      alert.type === "reminder" && "text-rare-blue-500",
                      alert.type === "info" && "text-rare-green-500"
                    )} 
                  />
                  <p className="text-sm font-medium">{alert.title}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{alert.description}</p>
                {alert.date && (
                  <p className="mt-1 text-xs text-muted-foreground">Due: {alert.date}</p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center rounded-md border border-dashed p-4">
            <p className="text-sm text-muted-foreground">No alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
