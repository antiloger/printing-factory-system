"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Job } from "@/app/page"
import {
  SIDE_PASTING_SIZE_RANGES,
  SIDE_PASTING_B_TO_S_TIME,
  SIDE_PASTING_TYPES,
  SIDE_PASTING_SIZE_RANGES_QUANTITY,
  SIDE_PASTING_RATES,
  BOTTOM_PASTING_SIZE_RANGES,
  BOTTOM_PASTING_B_TO_S_TIME,
  BOTTOM_PASTING_SIZE_RANGES_QUANTITY,
  BOTTOM_PASTING_RATES,
  calculatePastingProductionTime,
} from "@/lib/constants"

interface PastingJobFormProps {
  onAddJob: (job: Omit<Job, "id">) => void
  remainingShiftTime: number
}

export function PastingJobForm({ onAddJob, remainingShiftTime }: PastingJobFormProps) {
  const [pastingType, setPastingType] = useState<"side" | "bottom">("side")
  const [jobName, setJobName] = useState("")
  const [showWarning, setShowWarning] = useState(false)

  // Side Pasting Fields
  const [sideSizeRange, setSideSizeRange] = useState<string>("")
  const [sideBToS, setSideBToS] = useState(false)
  const [sideType, setSideType] = useState<string>("")
  const [sideQuantitySizeRange, setSideQuantitySizeRange] = useState<string>("")
  const [sideQuantity, setSideQuantity] = useState("")

  // Bottom Pasting Fields
  const [bottomSizeRange, setBottomSizeRange] = useState<string>("")
  const [bottomBToS, setBottomBToS] = useState(false)
  const [bottomQuantitySizeRange, setBottomQuantitySizeRange] = useState<string>("")
  const [bottomQuantity, setBottomQuantity] = useState("")

  // Calculate Side Pasting MR
  const calculateSideMR = (): number => {
    let mr = 0
    if (sideSizeRange) {
      const range = SIDE_PASTING_SIZE_RANGES.find((r) => r.value === sideSizeRange)
      if (range) mr += range.time
    }
    if (sideBToS) mr += SIDE_PASTING_B_TO_S_TIME
    return mr
  }

  // Calculate Side Pasting Production Time
  const calculateSideProductionTime = (): number => {
    if (!sideType || !sideQuantitySizeRange || !sideQuantity) return 0
    const quantity = Number.parseInt(sideQuantity)
    if (isNaN(quantity) || quantity <= 0) return 0
    const rate = SIDE_PASTING_RATES[sideType]?.[sideQuantitySizeRange]
    if (!rate) return 0
    return calculatePastingProductionTime(quantity, rate)
  }

  // Calculate Bottom Pasting MR
  const calculateBottomMR = (): number => {
    let mr = 0
    if (bottomSizeRange) {
      const range = BOTTOM_PASTING_SIZE_RANGES.find((r) => r.value === bottomSizeRange)
      if (range) mr += range.time
    }
    if (bottomBToS) mr += BOTTOM_PASTING_B_TO_S_TIME
    return mr
  }

  // Calculate Bottom Pasting Production Time
  const calculateBottomProductionTime = (): number => {
    if (!bottomQuantitySizeRange || !bottomQuantity) return 0
    const quantity = Number.parseInt(bottomQuantity)
    if (isNaN(quantity) || quantity <= 0) return 0
    const rate = BOTTOM_PASTING_RATES[bottomQuantitySizeRange]
    if (!rate) return 0
    return calculatePastingProductionTime(quantity, rate)
  }

  const totalMR = pastingType === "side" ? calculateSideMR() : calculateBottomMR()
  const productionTime = pastingType === "side" ? calculateSideProductionTime() : calculateBottomProductionTime()
  const totalJobTime = totalMR + productionTime
  const quantity = pastingType === "side" ? Number.parseInt(sideQuantity) || 0 : Number.parseInt(bottomQuantity) || 0

  const handleAddJob = () => {
    if (!jobName.trim()) {
      alert("Please enter a job name")
      return
    }

    if (pastingType === "side") {
      if (!sideSizeRange || !sideType || !sideQuantitySizeRange || !sideQuantity) {
        alert("Please fill in all required fields")
        return
      }
    } else {
      if (!bottomSizeRange || !bottomQuantitySizeRange || !bottomQuantity) {
        alert("Please fill in all required fields")
        return
      }
    }

    if (totalJobTime > remainingShiftTime) {
      setShowWarning(true)
      return
    }

    const newJob: Omit<Job, "id"> = {
      name: jobName,
      jobType: "pasting",
      pastingSubType: pastingType,
      plateSetupTime: 0,
      varnishBlanketTime: 0,
      colorWashTime: 0,
      productionTime,
      totalMR,
      totalJobTime,
      sheetCount: quantity,
    }

    onAddJob(newJob)
    resetForm()
  }

  const resetForm = () => {
    setJobName("")
    setSideSizeRange("")
    setSideBToS(false)
    setSideType("")
    setSideQuantitySizeRange("")
    setSideQuantity("")
    setBottomSizeRange("")
    setBottomBToS(false)
    setBottomQuantitySizeRange("")
    setBottomQuantity("")
  }

  return (
    <>
      <div className="space-y-6 w-full">
        {/* Pasting Type Selection */}
        <div className="space-y-2 w-full">
          <Label htmlFor="pasting-type" className="text-base font-semibold">
            Pasting Type
          </Label>
          <Select value={pastingType} onValueChange={(value) => setPastingType(value as "side" | "bottom")}>
            <SelectTrigger id="pasting-type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="side">Side Pasting</SelectItem>
              <SelectItem value="bottom">Bottom Pasting</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Name */}
        <div className="space-y-2">
          <Label htmlFor="job-name" className="text-base font-semibold">
            Job Name
          </Label>
          <Input
            id="job-name"
            placeholder="Enter job name"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
          />
        </div>

        {/* Side Pasting Form */}
        {pastingType === "side" && (
          <>
            {/* Make-Ready Section */}
            <Card className="border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-4 font-semibold text-foreground">Make-Ready Time</h3>
              <div className="space-y-4">
                {/* Size Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Size Range</Label>
                  <div className="space-y-2">
                    {SIDE_PASTING_SIZE_RANGES.map((range) => (
                      <label key={range.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="side-size-range"
                          value={range.value}
                          checked={sideSizeRange === range.value}
                          onChange={(e) => setSideSizeRange(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">
                          {range.label} ({range.time} min)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* B Pasting to S Pasting */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={sideBToS}
                    onChange={(e) => setSideBToS(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">B Pasting to S Pasting (+45 min)</span>
                </label>
              </div>
            </Card>

            {/* Quantity Section */}
            <Card className="border-accent/20 bg-accent/5 p-4">
              <h3 className="mb-4 font-semibold text-foreground">Quantity Details</h3>
              <div className="space-y-4">
                {/* Type */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="space-y-2">
                    {SIDE_PASTING_TYPES.map((type) => (
                      <label key={type.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="side-type"
                          value={type.value}
                          checked={sideType === type.value}
                          onChange={(e) => setSideType(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Size Range for Quantity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Size Range</Label>
                  <div className="space-y-2">
                    {SIDE_PASTING_SIZE_RANGES_QUANTITY.map((range) => (
                      <label key={range.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="side-quantity-size-range"
                          value={range.value}
                          checked={sideQuantitySizeRange === range.value}
                          onChange={(e) => setSideQuantitySizeRange(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="side-quantity" className="text-sm font-medium">
                    Quantity
                  </Label>
                  <Input
                    id="side-quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={sideQuantity}
                    onChange={(e) => setSideQuantity(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Bottom Pasting Form */}
        {pastingType === "bottom" && (
          <>
            {/* Make-Ready Section */}
            <Card className="border-primary/20 bg-primary/5 p-4">
              <h3 className="mb-4 font-semibold text-foreground">Make-Ready Time</h3>
              <div className="space-y-4">
                {/* Size Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Size Range</Label>
                  <div className="space-y-2">
                    {BOTTOM_PASTING_SIZE_RANGES.map((range) => (
                      <label key={range.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="bottom-size-range"
                          value={range.value}
                          checked={bottomSizeRange === range.value}
                          onChange={(e) => setBottomSizeRange(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">
                          {range.label} ({range.time} min)
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* B Pasting to S Pasting */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={bottomBToS}
                    onChange={(e) => setBottomBToS(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">B Pasting to S Pasting (+45 min)</span>
                </label>
              </div>
            </Card>

            {/* Quantity Section */}
            <Card className="border-accent/20 bg-accent/5 p-4">
              <h3 className="mb-4 font-semibold text-foreground">Quantity Details</h3>
              <div className="space-y-4">
                {/* Size Range for Quantity */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Size Range</Label>
                  <div className="space-y-2">
                    {BOTTOM_PASTING_SIZE_RANGES_QUANTITY.map((range) => (
                      <label key={range.value} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="bottom-quantity-size-range"
                          value={range.value}
                          checked={bottomQuantitySizeRange === range.value}
                          onChange={(e) => setBottomQuantitySizeRange(e.target.value)}
                          className="h-4 w-4"
                        />
                        <span className="text-sm">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label htmlFor="bottom-quantity" className="text-sm font-medium">
                    Quantity
                  </Label>
                  <Input
                    id="bottom-quantity"
                    type="number"
                    placeholder="Enter quantity"
                    value={bottomQuantity}
                    onChange={(e) => setBottomQuantity(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Total MR Display */}
        <Card className="border-primary/30 bg-primary/10 p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Make-Ready Time</p>
            <p className="text-xl font-bold text-primary">{totalMR.toFixed(0)} min</p>
          </div>
        </Card>

        {/* Total Job Time Display */}
        <Card className="border-accent/30 bg-accent/10 p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Job Time</p>
            <p className="text-3xl font-bold text-foreground">{totalJobTime.toFixed(0)} min</p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleAddJob} className="flex-1" size="lg">
            Add Job to Shift
          </Button>
          <Button onClick={resetForm} variant="outline" size="lg">
            Clear Form
          </Button>
        </div>
      </div>

      {/* Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent>
          <AlertDialogTitle>Shift Time Exceeded</AlertDialogTitle>
          <AlertDialogDescription>
            This job ({totalJobTime.toFixed(0)} min) would exceed the remaining shift time (
            {remainingShiftTime.toFixed(0)} min). Do you want to add it anyway?
          </AlertDialogDescription>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const newJob: Omit<Job, "id"> = {
                  name: jobName,
                  jobType: "pasting",
                  pastingSubType: pastingType,
                  plateSetupTime: 0,
                  varnishBlanketTime: 0,
                  colorWashTime: 0,
                  productionTime,
                  totalMR,
                  totalJobTime,
                  sheetCount: quantity,
                }
                onAddJob(newJob)
                resetForm()
                setShowWarning(false)
              }}
            >
              Add Anyway
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
