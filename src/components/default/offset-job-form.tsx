"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, RotateCcw } from "lucide-react"
import type { Job } from "@/app/page"
import {
  COLOR_WASH_TYPES,
  PLATE_SETUP_TIME_PER_PLATE,
  VARNISH_BLANKET_TIME_PER_BLANKET,
  getSheetRangeByCount,
} from "@/lib/constants"

interface OffsetJobFormProps {
  onAddJob: (job: Omit<Job, "id">) => void
  remainingShiftTime: number
  editingJob?: Job
  onCancelEdit?: () => void
}

export function OffsetJobForm({ onAddJob, remainingShiftTime, editingJob, onCancelEdit }: OffsetJobFormProps) {
  const [jobName, setJobName] = useState("")
  const [numPlates, setNumPlates] = useState("")
  const [hasVarnishBlanket, setHasVarnishBlanket] = useState(false)
  const [selectedColorWash, setSelectedColorWash] = useState<string>("")
  const [exactSheetCount, setExactSheetCount] = useState("")
  const [warning, setWarning] = useState("")

  const plateSetupTime = Number(numPlates) * PLATE_SETUP_TIME_PER_PLATE || 0
  const varnishBlanketTime = hasVarnishBlanket ? 1 * VARNISH_BLANKET_TIME_PER_BLANKET : 0

  const colorWashTime = selectedColorWash
    ? COLOR_WASH_TYPES.find((t) => t.value === selectedColorWash)?.multiplier || 0
    : 0

  const totalMR = plateSetupTime + varnishBlanketTime + colorWashTime

  const detectedRange = getSheetRangeByCount(Number(exactSheetCount))
  const sheetSpeed = detectedRange?.speed || 0
  const productionTime = sheetSpeed > 0 ? Number(exactSheetCount) / sheetSpeed : 0

  const totalJobTime = totalMR + productionTime

  useEffect(() => {
    if (editingJob) {
      setJobName(editingJob.name)
      setNumPlates(String(editingJob.plateSetupTime / PLATE_SETUP_TIME_PER_PLATE))
      setHasVarnishBlanket(editingJob.varnishBlanketTime > 0)
      setSelectedColorWash("")
    }
  }, [editingJob])

  useEffect(() => {
    if (totalJobTime > remainingShiftTime) {
      setWarning(
        `This job (${totalJobTime.toFixed(1)} min) exceeds remaining shift time (${remainingShiftTime.toFixed(1)} min)`,
      )
    } else {
      setWarning("")
    }
  }, [totalJobTime, remainingShiftTime])

  const handleClearForm = () => {
    setJobName("")
    setNumPlates("")
    setHasVarnishBlanket(false)
    setSelectedColorWash("")
    setExactSheetCount("")
    setWarning("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (totalJobTime > remainingShiftTime) {
      return
    }

    if (!jobName.trim()) {
      setWarning("Please enter a job name")
      return
    }

    const job: Omit<Job, "id"> = {
      name: jobName,
      plateSetupTime,
      varnishBlanketTime,
      colorWashTime,
      productionTime,
      totalMR,
      totalJobTime,
      sheetCount: Number(exactSheetCount) || 0, // Include sheet count in job data
    }

    onAddJob(job)

    handleClearForm()

    if (onCancelEdit) {
      onCancelEdit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="jobName">Job Name</Label>
        <Input
          id="jobName"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          placeholder="Enter job name or ID"
          required
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-semibold text-foreground">Make-Ready Time (MR)</h3>

        <div className="space-y-2">
          <Label htmlFor="numPlates">Number of Plates</Label>
          <Input
            id="numPlates"
            type="number"
            min="0"
            value={numPlates}
            onChange={(e) => setNumPlates(e.target.value)}
            placeholder="0"
          />
          <p className="text-sm text-muted-foreground">
            Time: {plateSetupTime.toFixed(1)} minutes (× {PLATE_SETUP_TIME_PER_PLATE} min/plate)
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasVarnishBlanket"
              checked={hasVarnishBlanket}
              onCheckedChange={(checked) => setHasVarnishBlanket(checked === true)}
            />
            <label
              htmlFor="hasVarnishBlanket"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Varnish Blanket Fix
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Time: {varnishBlanketTime.toFixed(1)} minutes{" "}
            {hasVarnishBlanket && `(1 × ${VARNISH_BLANKET_TIME_PER_BLANKET} min)`}
          </p>
        </div>

        <div className="space-y-3">
          <Label>Color Wash Type (Select One)</Label>
          <RadioGroup value={selectedColorWash} onValueChange={setSelectedColorWash}>
            <div className="space-y-2">
              {COLOR_WASH_TYPES.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={type.value} />
                  <label
                    htmlFor={type.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {type.label} ({type.multiplier} min)
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>
          {selectedColorWash && (
            <p className="text-sm text-muted-foreground">
              Time: {colorWashTime.toFixed(1)} minutes (
              {COLOR_WASH_TYPES.find((t) => t.value === selectedColorWash)?.label})
            </p>
          )}
        </div>

        <div className="rounded-md bg-accent/10 p-3">
          <p className="text-sm font-medium text-foreground">
            Total MR Time: <span className="text-lg font-bold text-foreground">{totalMR.toFixed(1)}</span> minutes
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-semibold text-foreground">Production Run Time</h3>

        <div className="space-y-2">
          <Label htmlFor="exactSheetCount">Sheet Count</Label>
          <Input
            id="exactSheetCount"
            type="number"
            min="0"
            value={exactSheetCount}
            onChange={(e) => setExactSheetCount(e.target.value)}
            placeholder="Enter number of sheets"
          />
          {detectedRange && Number(exactSheetCount) > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Range: {detectedRange.label} ({detectedRange.speed} sheets/min)
              </p>
              <p className="text-sm text-muted-foreground">Time: {productionTime.toFixed(1)} minutes</p>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-md bg-primary/10 p-4">
        <p className="text-lg font-semibold text-foreground">
          Total Job Time: <span className="text-2xl font-bold text-primary">{totalJobTime.toFixed(1)}</span> minutes
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          MR: {totalMR.toFixed(1)} min + Production: {productionTime.toFixed(1)} min
        </p>
      </div>

      {warning && (
        <Alert variant={totalJobTime > remainingShiftTime ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{warning}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={totalJobTime > remainingShiftTime || !jobName.trim()} className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          {editingJob ? "Update Job" : "Add Job to Shift"}
        </Button>
        <Button type="button" variant="outline" onClick={handleClearForm}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Clear Form
        </Button>
        {onCancelEdit && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
