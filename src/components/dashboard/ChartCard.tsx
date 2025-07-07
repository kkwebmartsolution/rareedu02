
import React from "react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  description?: string;
  type: "line" | "bar";
  data: any[];
  className?: string;
  height?: number;
}

export default function ChartCard({
  title,
  description,
  type,
  data,
  className,
  height = 300,
}: ChartCardProps) {
  return (
    <div className={cn("chart-container", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#0078BE" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#E53935" 
                strokeWidth={2} 
                dot={{ r: 3 }} 
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#0078BE" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#E53935" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
