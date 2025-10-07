"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Plus, RotateCcw } from "lucide-react"
import type { Job } from "@/app/page"
import {
  SHEET_RANGES,
  COLOR_WASH_TYPES,
  PLATE_SETUP_TIME_PER_PLATE,
  VARNISH_BLANKET_TIME_PER_BLANKET,
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
  const [numBlankets, setNumBlankets] = useState("")
  const [colorWashType, setColorWashType] = useState("")
  const [colorWashPlates, setColorWashPlates] = useState("")
  const [sheetRange, setSheetRange] = useState("")
  const [exactSheetCount, setExactSheetCount] = useState("")
  const [warning, setWarning] = useState("")

  const plateSetupTime = Number(numPlates) * PLATE_SETUP_TIME_PER_PLATE || 0
  const varnishBlanketTime = Number(numBlankets) * VARNISH_BLANKET_TIME_PER_BLANKET || 0

  const colorWashMultiplier = COLOR_WASH_TYPES.find((t) => t.value === colorWashType)?.multiplier || 0
  const colorWashTime = Number(colorWashPlates) * colorWashMultiplier || 0

  const totalMR = plateSetupTime + varnishBlanketTime + colorWashTime

  const sheetSpeed = SHEET_RANGES.find((r) => r.value === sheetRange)?.speed || 0
  const productionTime = sheetSpeed > 0 ? Number(exactSheetCount) / sheetSpeed : 0

  const totalJobTime = totalMR + productionTime

  // Load editing job data
  useEffect(() => {
    if (editingJob) {
      setJobName(editingJob.name)
      setNumPlates(String(editingJob.plateSetupTime / PLATE_SETUP_TIME_PER_PLATE))
      setNumBlankets(String(editingJob.varnishBlanketTime / VARNISH_BLANKET_TIME_PER_BLANKET))
      // For color wash, we need to determine which type was used
      const colorWashPlatesCalc = editingJob.colorWashTime
      setColorWashPlates(String(colorWashPlatesCalc))
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
    setNumBlankets("")
    setColorWashType("")
    setColorWashPlates("")
    setSheetRange("")
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
    }

    onAddJob(job)

    // Reset form
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
          <Label htmlFor="numBlankets">Number of Blankets (Varnish)</Label>
          <Input
            id="numBlankets"
            type="number"
            min="0"
            value={numBlankets}
            onChange={(e) => setNumBlankets(e.target.value)}
            placeholder="0"
          />
          <p className="text-sm text-muted-foreground">
            Time: {varnishBlanketTime.toFixed(1)} minutes (× {VARNISH_BLANKET_TIME_PER_BLANKET} min/blanket)
          </p>
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="colorWashType">Color Wash Type</Label>
          <Select value={colorWashType} onValueChange={setColorWashType}>
            <SelectTrigger id="colorWashType" className="w-full">
              <SelectValue placeholder="Select wash type" />
            </SelectTrigger>
            <SelectContent>
              {COLOR_WASH_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {colorWashType && (
          <div className="space-y-2">
            <Label htmlFor="colorWashPlates">Number of Plates (Color Wash)</Label>
            <Input
              id="colorWashPlates"
              type="number"
              min="0"
              value={colorWashPlates}
              onChange={(e) => setColorWashPlates(e.target.value)}
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">
              Time: {colorWashTime.toFixed(1)} minutes (× {colorWashMultiplier} min/plate)
            </p>
          </div>
        )}

        <div className="rounded-md bg-accent/10 p-3">
          <p className="text-sm font-medium text-foreground">
            Total MR Time: <span className="text-lg font-bold text-accent">{totalMR.toFixed(1)}</span> minutes
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
        <h3 className="font-semibold text-foreground">Production Run Time</h3>

        <div className="space-y-2 w-full" >
          <Label htmlFor="sheetRange">Sheet Range</Label>
          <Select value={sheetRange} onValueChange={setSheetRange}>
            <SelectTrigger id="sheetRange" className="w-full">
              <SelectValue placeholder="Select sheet range" />
            </SelectTrigger>
            <SelectContent>
              {SHEET_RANGES.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label} ({range.speed} sheets/min)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {sheetRange && (
          <div className="space-y-2">
            <Label htmlFor="exactSheetCount">Exact Sheet Count</Label>
            <Input
              id="exactSheetCount"
              type="number"
              min="0"
              value={exactSheetCount}
              onChange={(e) => setExactSheetCount(e.target.value)}
              placeholder="0"
            />
            <p className="text-sm text-muted-foreground">
              Time: {productionTime.toFixed(1)} minutes (÷ {sheetSpeed} sheets/min)
            </p>
          </div>
        )}
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
