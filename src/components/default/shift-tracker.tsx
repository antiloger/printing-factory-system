"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle2, Clock, Trash2, FileText } from "lucide-react"
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
import {
  SHIFT_DURATION_PRESETS,
  MIN_SHIFT_DURATION,
  MAX_SHIFT_DURATION,
  formatShiftDuration,
} from "@/lib/constants"

interface ShiftTrackerProps {
  totalJobsTime: number
  remainingShiftTime: number
  setupTime: number
  shiftDuration: number
  onShiftDurationChange: (minutes: number) => void
  jobCount: number
  totalSheetCount: number
  onClearShift: () => void
  isPasting?: boolean
}

export function ShiftTracker({
  totalJobsTime,
  remainingShiftTime,
  setupTime,
  shiftDuration,
  onShiftDurationChange,
  jobCount,
  totalSheetCount,
  onClearShift,
  isPasting = false,
}: ShiftTrackerProps) {
  const [isCustom, setIsCustom] = useState(
    () => !SHIFT_DURATION_PRESETS.some((preset) => preset.value === shiftDuration),
  )
  const [customValue, setCustomValue] = useState(String(shiftDuration))

  const handlePresetSelect = (minutes: number) => {
    setIsCustom(false)
    setCustomValue(String(minutes))
    onShiftDurationChange(minutes)
  }

  const handleCustomSelect = () => {
    setIsCustom(true)
    setCustomValue(String(shiftDuration))
  }

  const handleCustomChange = (value: string) => {
    setCustomValue(value)
    const minutes = Number(value)
    if (value !== "" && Number.isFinite(minutes) && minutes >= MIN_SHIFT_DURATION && minutes <= MAX_SHIFT_DURATION) {
      onShiftDurationChange(minutes)
    }
  }

  const handleCustomBlur = () => {
    const minutes = Number(customValue)
    if (customValue === "" || !Number.isFinite(minutes) || minutes < MIN_SHIFT_DURATION) {
      setCustomValue(String(shiftDuration))
      return
    }
    const clamped = Math.min(minutes, MAX_SHIFT_DURATION)
    setCustomValue(String(clamped))
    onShiftDurationChange(clamped)
  }

  const usedTime = setupTime + totalJobsTime
  const utilizationPercentage = (usedTime / shiftDuration) * 100
  const isOverCapacity = remainingShiftTime < 0

  const getProgressColor = () => {
    if (isOverCapacity) return "bg-destructive"
    if (utilizationPercentage > 90) return "bg-warning"
    return "bg-success"
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-accent p-6">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Shift Time Tracker</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Single shift duration: {shiftDuration} minutes ({formatShiftDuration(shiftDuration)})
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-md border border-border bg-card p-1">
                {SHIFT_DURATION_PRESETS.map((preset) => (
                  <Button
                    key={preset.value}
                    type="button"
                    size="sm"
                    variant={!isCustom && shiftDuration === preset.value ? "default" : "ghost"}
                    onClick={() => handlePresetSelect(preset.value)}
                  >
                    {preset.label}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant={isCustom ? "default" : "ghost"}
                  onClick={handleCustomSelect}
                >
                  Custom
                </Button>
              </div>
              {isCustom && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={MIN_SHIFT_DURATION}
                    max={MAX_SHIFT_DURATION}
                    step={1}
                    value={customValue}
                    onChange={(e) => handleCustomChange(e.target.value)}
                    onBlur={handleCustomBlur}
                    className="h-8 w-28 bg-card"
                    aria-label="Custom shift duration in minutes"
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
              )}
            </div>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          <div className="rounded-lg bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              {isPasting ? "Total Quantity" : "Total Sheets"}
            </div>
            <p className="mt-2 text-2xl font-bold text-foreground">{totalSheetCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              {jobCount} job{jobCount !== 1 ? "s" : ""}
            </p>
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
          <div className={`h-3 w-full overflow-hidden rounded-full bg-muted ${getProgressColor()}`}>
            <div
              className={`h-full ${getProgressColor()} transition-all`}
              style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
            />
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
