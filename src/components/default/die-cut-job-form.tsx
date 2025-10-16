"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, RotateCcw } from "lucide-react"
import type { Job } from "@/app/page"
import {
  calculateDiecutNewMR,
  calculateDiecutStriping,
  getDiecutRunLengthRange,
  DIECUT_EMBOSS_TIME_PER_UP,
  DIECUT_REPEATED_MR_TIME,
  DIECUT_MR_SHEETS_TIME, // Added MR Sheets constant
} from "@/lib/constants"

interface DieCutJobFormProps {
  onAddJob: (job: Omit<Job, "id">) => void
  remainingShiftTime: number
  editingJob?: Job
  onCancelEdit?: () => void
}

export function DieCutJobForm({ onAddJob, remainingShiftTime, editingJob, onCancelEdit }: DieCutJobFormProps) {
  const [jobName, setJobName] = useState("")

  // Field 1: New MR
  const [hasNewMR, setHasNewMR] = useState(false)
  const [newMRUps, setNewMRUps] = useState("")

  // Field 2: Emboss
  const [hasEmboss, setHasEmboss] = useState(false)
  const [embossUps, setEmbossUps] = useState("")

  // Field 3: Repeated MR
  const [hasRepeatedMR, setHasRepeatedMR] = useState(false)

  // Field 3.5: MR Sheets
  const [hasMRSheets, setHasMRSheets] = useState(false)

  // Field 4: Striping
  const [stripingCount, setStripingCount] = useState("")

  // Field 5: Run Length
  const [runLength, setRunLength] = useState("")

  const [warning, setWarning] = useState("")

  // Calculate individual field times
  const newMRTime = hasNewMR && newMRUps ? calculateDiecutNewMR(Number(newMRUps)) : 0
  const embossTime = hasEmboss && embossUps ? Number(embossUps) * DIECUT_EMBOSS_TIME_PER_UP : 0
  const repeatedMRTime = hasRepeatedMR ? DIECUT_REPEATED_MR_TIME : 0
  const mrSheetsTime = hasMRSheets ? DIECUT_MR_SHEETS_TIME : 0 // Added MR Sheets time calculation
  const stripingTime = stripingCount ? calculateDiecutStriping(Number(stripingCount)) : 0

  const totalMR = newMRTime + embossTime + repeatedMRTime + mrSheetsTime + stripingTime // Added mrSheetsTime to total

  // Calculate production time
  const detectedRange = getDiecutRunLengthRange(Number(runLength))
  const runSpeed = detectedRange?.speed || 0
  const productionTime = runSpeed > 0 ? Number(runLength) / runSpeed : 0

  const totalJobTime = totalMR + productionTime

  useEffect(() => {
    if (editingJob) {
      setJobName(editingJob.name)
      // Reset form fields when editing
      setHasNewMR(false)
      setNewMRUps("")
      setHasEmboss(false)
      setEmbossUps("")
      setHasRepeatedMR(false)
      setHasMRSheets(false) // Added MR Sheets to reset
      setStripingCount("")
      setRunLength(String(editingJob.sheetCount))
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
    setHasNewMR(false)
    setNewMRUps("")
    setHasEmboss(false)
    setEmbossUps("")
    setHasRepeatedMR(false)
    setHasMRSheets(false) // Added MR Sheets to clear form
    setStripingCount("")
    setRunLength("")
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
      jobType: "die-cut",
      plateSetupTime: newMRTime,
      varnishBlanketTime: embossTime,
      colorWashTime: repeatedMRTime,
      stripingTime: stripingTime,
      productionTime,
      totalMR,
      totalJobTime,
      sheetCount: Number(runLength) || 0,
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

        {/* Field 1: New MR */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="hasNewMR" checked={hasNewMR} onCheckedChange={(checked) => setHasNewMR(checked === true)} />
            <label
              htmlFor="hasNewMR"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              New MR
            </label>
          </div>
          {hasNewMR && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="newMRUps">Ups</Label>
              <Input
                id="newMRUps"
                type="number"
                min="1"
                value={newMRUps}
                onChange={(e) => setNewMRUps(e.target.value)}
                placeholder="Enter number of ups"
              />
              {newMRUps && (
                <p className="text-sm text-muted-foreground">
                  Time: {newMRTime.toFixed(1)} minutes
                  {Number(newMRUps) <= 10 ? " (base time)" : ` (60 + ${Number(newMRUps) - 10} × 4 = ${newMRTime})`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Field 2: Emboss */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasEmboss"
              checked={hasEmboss}
              onCheckedChange={(checked) => setHasEmboss(checked === true)}
            />
            <label
              htmlFor="hasEmboss"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Emboss
            </label>
          </div>
          {hasEmboss && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="embossUps">Ups</Label>
              <Input
                id="embossUps"
                type="number"
                min="1"
                value={embossUps}
                onChange={(e) => setEmbossUps(e.target.value)}
                placeholder="Enter number of ups"
              />
              {embossUps && (
                <p className="text-sm text-muted-foreground">
                  Time: {embossTime.toFixed(1)} minutes ({embossUps} × {DIECUT_EMBOSS_TIME_PER_UP} min)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Field 3: Repeated MR */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasRepeatedMR"
              checked={hasRepeatedMR}
              onCheckedChange={(checked) => setHasRepeatedMR(checked === true)}
            />
            <label
              htmlFor="hasRepeatedMR"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Repeated MR
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Time: {repeatedMRTime.toFixed(1)} minutes {hasRepeatedMR && `(${DIECUT_REPEATED_MR_TIME} min)`}
          </p>
        </div>

        {/* Field 3.5: MR Sheets */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasMRSheets"
              checked={hasMRSheets}
              onCheckedChange={(checked) => setHasMRSheets(checked === true)}
            />
            <label
              htmlFor="hasMRSheets"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              MR Sheets
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            Time: {mrSheetsTime.toFixed(1)} minutes {hasMRSheets && `(${DIECUT_MR_SHEETS_TIME} min)`}
          </p>
        </div>

        {/* Field 4: Striping */}
        <div className="space-y-2">
          <Label htmlFor="stripingCount">Striping</Label>
          <Input
            id="stripingCount"
            type="number"
            min="0"
            value={stripingCount}
            onChange={(e) => setStripingCount(e.target.value)}
            placeholder="Enter striping count"
          />
          {stripingCount && Number(stripingCount) > 0 && (
            <p className="text-sm text-muted-foreground">
              Time: {stripingTime.toFixed(1)} minutes
              {Number(stripingCount) <= 40
                ? ` (${stripingCount} × 1.5)`
                : Number(stripingCount) <= 80
                  ? ` (${stripingCount} × 1.15)`
                  : " (out of range)"}
            </p>
          )}
        </div>

        <div className="rounded-md bg-accent/10 p-3">
          <p className="text-sm font-medium text-foreground">
            Total MR Time: <span className="text-lg font-bold text-accent">{totalMR.toFixed(1)}</span> minutes
          </p>
        </div>
      </div>

      {/* Field 5: Run Length */}
      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-semibold text-foreground">Production Run Time</h3>

        <div className="space-y-2">
          <Label htmlFor="runLength">Run Length</Label>
          <Input
            id="runLength"
            type="number"
            min="0"
            value={runLength}
            onChange={(e) => setRunLength(e.target.value)}
            placeholder="Enter run length"
          />
          {detectedRange && Number(runLength) > 0 && (
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
