"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ShiftTrackerProps {
  totalJobsTime: number
  remainingShiftTime: number
  setupTime: number
  shiftDuration: number
  jobCount: number
  onClearShift: () => void
}

export function ShiftTracker({
  totalJobsTime,
  remainingShiftTime,
  setupTime,
  shiftDuration,
  jobCount,
  onClearShift,
}: ShiftTrackerProps) {
  const usedTime = setupTime + totalJobsTime
  const utilizationPercentage = (usedTime / shiftDuration) * 100
  const isOverCapacity = remainingShiftTime < 0

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Shift Time Tracker</h2>
            <p className="mt-1 text-sm text-muted-foreground">Single shift duration: {shiftDuration} minutes</p>
          </div>
          {jobCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Shift
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all jobs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {jobCount} scheduled job(s) from the shift. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClearShift}>Clear Shift</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Setup Time
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{setupTime} min</p>
            <p className="text-xs text-muted-foreground">Constant per shift</p>
          </div>

          <div className="rounded-lg bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Jobs Time
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalJobsTime.toFixed(1)} min</p>
            <p className="text-xs text-muted-foreground">
              {jobCount} job{jobCount !== 1 ? "s" : ""} scheduled
            </p>
          </div>

          <div className="rounded-lg bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Used Time
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{usedTime.toFixed(1)} min</p>
            <p className="text-xs text-muted-foreground">{utilizationPercentage.toFixed(1)}% utilized</p>
          </div>

          <div
            className={`rounded-lg p-4 ${isOverCapacity ? "bg-destructive/10" : remainingShiftTime < 60 ? "bg-warning/10" : "bg-success/10"
              }`}
          >
            <div className="flex items-center gap-2 text-sm">
              {isOverCapacity ? (
                <AlertCircle className="h-4 w-4 text-destructive" />
              ) : (
                <CheckCircle2 className={`h-4 w-4 ${remainingShiftTime < 60 ? "text-warning" : "text-success"}`} />
              )}
              <span
                className={
                  isOverCapacity ? "text-destructive" : remainingShiftTime < 60 ? "text-warning" : "text-success"
                }
              >
                Remaining Time
              </span>
            </div>
            <p
              className={`mt-2 text-2xl font-bold ${isOverCapacity ? "text-destructive" : remainingShiftTime < 60 ? "text-warning" : "text-success"
                }`}
            >
              {remainingShiftTime.toFixed(1)} min
            </p>
            <p className="text-xs text-muted-foreground">
              {isOverCapacity ? "Over capacity!" : remainingShiftTime < 60 ? "Almost full" : "Available"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">Shift Utilization</span>
            <span className="font-mono font-semibold text-foreground">{utilizationPercentage.toFixed(1)}%</span>
          </div>
          {isOverCapacity && (
            <p className="mt-2 text-sm text-destructive">
              ⚠️ Shift is over capacity by {Math.abs(remainingShiftTime).toFixed(1)} minutes
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
