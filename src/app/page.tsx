"use client"

import { useState } from "react"
import { JobsTable } from "@/components/default/jobs-table"
import { ShiftTracker } from "@/components/default/shift-tracker"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SHIFT_DURATION, SETUP_TIME } from "@/lib/constants"
import { OffsetJobForm } from "@/components/default/offset-job-form"

export interface Job {
  id: string
  name: string
  plateSetupTime: number
  varnishBlanketTime: number
  colorWashTime: number
  productionTime: number
  totalMR: number
  totalJobTime: number
}

export default function PrintingFactoryPage() {
  const [jobs, setJobs] = useState<Job[]>([])

  const totalJobsTime = jobs.reduce((sum, job) => sum + job.totalJobTime, 0)
  const remainingShiftTime = SHIFT_DURATION - SETUP_TIME - totalJobsTime

  const handleAddJob = (job: Omit<Job, "id">) => {
    const newJob = {
      ...job,
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setJobs([...jobs, newJob])
  }

  const handleRemoveJob = (id: string) => {
    setJobs(jobs.filter((job) => job.id !== id))
  }

  const handleEditJob = (id: string, updatedJob: Omit<Job, "id">) => {
    setJobs(jobs.map((job) => (job.id === id ? { ...updatedJob, id } : job)))
  }

  const handleClearShift = () => {
    setJobs([])
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Printing Factory Time Planning</h1>
          <p className="mt-2 text-muted-foreground">Manage job scheduling and shift routing for production workflows</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="offset" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="offset">Off-set</TabsTrigger>
            <TabsTrigger value="die-cut" disabled>
              Die-cut
            </TabsTrigger>
            <TabsTrigger value="pasting" disabled>
              Pasting
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offset" className="space-y-6">
            <ShiftTracker
              totalJobsTime={totalJobsTime}
              remainingShiftTime={remainingShiftTime}
              setupTime={SETUP_TIME}
              shiftDuration={SHIFT_DURATION}
              jobCount={jobs.length}
              onClearShift={handleClearShift}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="p-6">
                <h2 className="mb-6 text-2xl font-semibold text-foreground">Create New Job</h2>
                <OffsetJobForm onAddJob={handleAddJob} remainingShiftTime={remainingShiftTime} />
              </Card>

              <div className="space-y-6">
                <JobsTable jobs={jobs} onRemoveJob={handleRemoveJob} onEditJob={handleEditJob} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
