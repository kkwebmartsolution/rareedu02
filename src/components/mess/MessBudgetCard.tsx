import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, DollarSign, Calendar, AlertTriangle } from "lucide-react";
import type { Hostel } from "@/lib/hostels-api";

interface MessBudgetCardProps {
  hostel: Hostel;
  onUpdate: () => void;
}

export default function MessBudgetCard({ hostel, onUpdate }: MessBudgetCardProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState(hostel.mess_budget?.toString() || "0");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentYear = new Date().getFullYear();
  const budgetYear = hostel.mess_budget_year || currentYear;
  const totalBudget = hostel.mess_budget || 0;
  const remainingBudget = hostel.mess_budget_remaining || 0;
  const usedBudget = totalBudget - remainingBudget;
  const usedPercentage = totalBudget > 0 ? (usedBudget / totalBudget) * 100 : 0;
  const isOverBudget = remainingBudget < 0;

  const handleSaveBudget = async () => {
    setIsSubmitting(true);
    try {
      const budgetAmount = parseFloat(budget) || 0;
      
      const { error } = await supabase
        .from('hostels')
        .update({
          mess_budget: budgetAmount,
          mess_budget_remaining: budgetAmount, // Reset remaining to full amount when setting new budget
          mess_budget_year: currentYear,
          updated_at: new Date().toISOString()
        })
        .eq('id', hostel.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Mess budget updated for ${hostel.name}`,
      });
      
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating mess budget:', error);
      toast({
        title: "Error",
        description: "Failed to update mess budget",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={isOverBudget ? "border-destructive" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {hostel.name}
            {isOverBudget && <AlertTriangle className="h-4 w-4 text-destructive" />}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{budgetYear}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-medium">Total Budget:</span>
              </div>
              <span className="text-lg font-bold">₹{totalBudget.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remaining:</span>
              <span className={`font-medium ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                ₹{remainingBudget.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Used:</span>
              <span className="font-medium text-destructive">₹{usedBudget.toLocaleString()}</span>
            </div>

            {isOverBudget && (
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  Over Budget by ₹{Math.abs(remainingBudget).toLocaleString()}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Budget Usage</span>
                <span>{usedPercentage.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(usedPercentage, 100)} 
                className="h-2"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              {totalBudget > 0 ? 'Update Budget' : 'Set Budget'}
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`budget-${hostel.id}`}>
                Mess Budget for {currentYear} (₹)
              </Label>
              <Input
                id={`budget-${hostel.id}`}
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="Enter budget amount"
              />
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleSaveBudget}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setBudget(hostel.mess_budget?.toString() || "0");
                }}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}