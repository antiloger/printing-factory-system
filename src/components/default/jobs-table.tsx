"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Clock } from "lucide-react"
import type { Job } from "@/app/page"

interface JobsTableProps {
  jobs: Job[]
  onRemoveJob: (id: string) => void
  onEditJob: (id: string, job: Omit<Job, "id">) => void
}

export function JobsTable({ jobs, onRemoveJob }: JobsTableProps) {
  if (jobs.length === 0) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Clock className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold text-foreground">No Jobs Scheduled</h3>
          <p className="text-sm text-muted-foreground">Add your first job to start planning the shift</p>
        </div>
      </Card>
    )
  }

  const totalTime = jobs.reduce((sum, job) => sum + job.totalJobTime, 0)
  const totalSheets = jobs.reduce((sum, job) => sum + job.sheetCount, 0)

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/50 p-4">
        <h2 className="text-xl font-semibold text-foreground">Scheduled Jobs ({jobs.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead className="text-right">Sheet Count</TableHead>
              <TableHead className="text-right">MR Time</TableHead>
              <TableHead className="text-right">Production</TableHead>
              <TableHead className="text-right">Total Time</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.name}</TableCell>
                <TableCell className="text-right font-mono">{job.sheetCount.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono">{job.totalMR.toFixed(1)} min</TableCell>
                <TableCell className="text-right font-mono">{job.productionTime.toFixed(1)} min</TableCell>
                <TableCell className="text-right font-mono font-semibold">{job.totalJobTime.toFixed(1)} min</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveJob(job.id)}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="border-t border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Sheets:</span>
              <span className="ml-4 text-lg font-bold text-foreground">{totalSheets.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">Total Jobs Time:</span>
              <span className="ml-4 text-xl font-bold text-primary">{totalTime.toFixed(1)} min</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
