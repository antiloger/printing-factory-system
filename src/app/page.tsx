"use client"

import { useState } from "react"
import { OffsetJobForm } from "@/components/default/offset-job-form"
import { DieCutJobForm } from "@/components/default/die-cut-job-form"
import { JobsTable } from "@/components/default/jobs-table"
import { ShiftTracker } from "@/components/default/shift-tracker"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SHIFT_DURATION, SETUP_TIME_OFFSET, SETUP_TIME_DIECUT, SETUP_TIME_PASTING } from "@/lib/constants"
import { PastingJobForm } from "@/components/default/pasting-job-form"

export interface Job {
  id: string
  name: string
  jobType: "offset" | "die-cut" | "pasting"
  pastingSubType?: "side" | "bottom"
  plateSetupTime: number
  varnishBlanketTime: number
  colorWashTime: number
  stripingTime?: number
  productionTime: number
  totalMR: number
  totalJobTime: number
  sheetCount: number
}

export default function PrintingFactoryPage() {
  const [offsetJobs, setOffsetJobs] = useState<Job[]>([])
  const [dieCutJobs, setDieCutJobs] = useState<Job[]>([])
  const [pastingJobs, setPastingJobs] = useState<Job[]>([])
  const [activeTab, setActiveTab] = useState("offset")

  const currentJobs = activeTab === "offset" ? offsetJobs : activeTab === "die-cut" ? dieCutJobs : pastingJobs
  const setupTime =
    activeTab === "offset" ? SETUP_TIME_OFFSET : activeTab === "die-cut" ? SETUP_TIME_DIECUT : SETUP_TIME_PASTING

  const totalJobsTime = currentJobs.reduce((sum, job) => sum + job.totalJobTime, 0)
  const totalSheetCount = currentJobs.reduce((sum, job) => sum + job.sheetCount, 0)
  const remainingShiftTime = SHIFT_DURATION - setupTime - totalJobsTime

  const handleAddJob = (job: Omit<Job, "id">) => {
    const newJob = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    if (activeTab === "offset") {
      setOffsetJobs([...offsetJobs, newJob])
    } else if (activeTab === "die-cut") {
      setDieCutJobs([...dieCutJobs, newJob])
    } else {
      setPastingJobs([...pastingJobs, newJob])
    }
  }

  const handleRemoveJob = (id: string) => {
    if (activeTab === "offset") {
      setOffsetJobs(offsetJobs.filter((job) => job.id !== id))
    } else if (activeTab === "die-cut") {
      setDieCutJobs(dieCutJobs.filter((job) => job.id !== id))
    } else {
      setPastingJobs(pastingJobs.filter((job) => job.id !== id))
    }
  }

  const handleEditJob = (id: string, updatedJob: Omit<Job, "id">) => {
    if (activeTab === "offset") {
      setOffsetJobs(offsetJobs.map((job) => (job.id === id ? { ...updatedJob, id } : job)))
    } else if (activeTab === "die-cut") {
      setDieCutJobs(dieCutJobs.map((job) => (job.id === id ? { ...updatedJob, id } : job)))
    } else {
      setPastingJobs(pastingJobs.map((job) => (job.id === id ? { ...updatedJob, id } : job)))
    }
  }

  const handleClearShift = () => {
    if (activeTab === "offset") {
      setOffsetJobs([])
    } else if (activeTab === "die-cut") {
      setDieCutJobs([])
    } else {
      setPastingJobs([])
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Printing Factory Time Planning</h1>
          <p className="mt-2 font-bold text-muted-foreground">
            Shiwanka Edirisinghe
          </p>
          <p className="text-muted-foreground">Manage job scheduling and shift routing for production workflows</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="offset" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="offset">Off-set</TabsTrigger>
            <TabsTrigger value="die-cut">Die-cut</TabsTrigger>
            <TabsTrigger value="pasting">Pasting</TabsTrigger>
          </TabsList>

          <TabsContent value="offset" className="space-y-6">
            <ShiftTracker
              totalJobsTime={totalJobsTime}
              remainingShiftTime={remainingShiftTime}
              setupTime={setupTime}
              shiftDuration={SHIFT_DURATION}
              jobCount={currentJobs.length}
              totalSheetCount={totalSheetCount}
              onClearShift={handleClearShift}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-semibold text-foreground">Create New Job</h2>
                <OffsetJobForm onAddJob={handleAddJob} remainingShiftTime={remainingShiftTime} />
              </Card>

              <div className="space-y-6">
                <JobsTable jobs={currentJobs} onRemoveJob={handleRemoveJob} onEditJob={handleEditJob} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="die-cut" className="space-y-6">
            <ShiftTracker
              totalJobsTime={totalJobsTime}
              remainingShiftTime={remainingShiftTime}
              setupTime={setupTime}
              shiftDuration={SHIFT_DURATION}
              jobCount={currentJobs.length}
              totalSheetCount={totalSheetCount}
              onClearShift={handleClearShift}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-semibold text-foreground">Create New Job</h2>
                <DieCutJobForm onAddJob={handleAddJob} remainingShiftTime={remainingShiftTime} />
              </Card>

              <div className="space-y-6">
                <JobsTable jobs={currentJobs} onRemoveJob={handleRemoveJob} onEditJob={handleEditJob} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pasting" className="space-y-6">
            <ShiftTracker
              totalJobsTime={totalJobsTime}
              remainingShiftTime={remainingShiftTime}
              setupTime={setupTime}
              shiftDuration={SHIFT_DURATION}
              jobCount={currentJobs.length}
              totalSheetCount={totalSheetCount}
              onClearShift={handleClearShift}
              isPasting={true}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-semibold text-foreground">Create New Job</h2>
                <PastingJobForm onAddJob={handleAddJob} remainingShiftTime={remainingShiftTime} />
              </Card>

              <div className="space-y-6">
                <JobsTable
                  jobs={currentJobs}
                  onRemoveJob={handleRemoveJob}
                  onEditJob={handleEditJob}
                  isPasting={true}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
