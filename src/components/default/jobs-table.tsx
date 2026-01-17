"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Clock, Download } from "lucide-react"
import type { Job } from "@/app/page"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface JobsTableProps {
  jobs: Job[]
  onRemoveJob: (id: string) => void
  onEditJob: (id: string, job: Omit<Job, "id">) => void
  isPasting?: boolean
}

export function JobsTable({ jobs, onRemoveJob, isPasting = false }: JobsTableProps) {
  const totalTime = jobs.reduce((sum, job) => sum + job.totalJobTime, 0)
  const totalQuantity = jobs.reduce((sum, job) => sum + job.sheetCount, 0)

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", format: "a4" })

    // Title
    doc.setFontSize(18)
    doc.text(`Scheduled Jobs (${jobs.length})`, 14, 20)

    // Summary info
    doc.setFontSize(12)
    doc.text(`${isPasting ? "Total Quantity" : "Total Sheets"}: ${totalQuantity.toLocaleString()}`, 14, 30)

    // Table headers and body based on isPasting
    const headers = isPasting
      ? [["Job Name", "Type", "Quantity", "MR Time", "Production", "Total Time"]]
      : [["Job Name", "Sheet Count", "MR Time", "Production", "Total Time"]]

    const body = jobs.map((job) =>
      isPasting
        ? [
          job.name,
          job.pastingSubType === "side" ? "Side" : "Bottom",
          job.sheetCount.toLocaleString(),
          `${job.totalMR.toFixed(1)} min`,
          `${job.productionTime.toFixed(1)} min`,
          `${job.totalJobTime.toFixed(1)} min`,
        ]
        : [
          job.name,
          job.sheetCount.toLocaleString(),
          `${job.totalMR.toFixed(1)} min`,
          `${job.productionTime.toFixed(1)} min`,
          `${job.totalJobTime.toFixed(1)} min`,
        ]
    )

    // Footer row
    const footer = isPasting
      ? [["Total", "", totalQuantity.toLocaleString(), "", "", `${totalTime.toFixed(1)} min`]]
      : [["Total", totalQuantity.toLocaleString(), "", "", `${totalTime.toFixed(1)} min`]]

    autoTable(doc, {
      startY: 40,
      head: headers,
      body: body,
      foot: footer,
      theme: "striped",
      headStyles: {
        fillColor: [41, 41, 41],
        textColor: 255,
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      columnStyles: isPasting
        ? {
          0: { cellWidth: 60 },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
          5: { halign: "right" },
        }
        : {
          0: { cellWidth: 80 },
          1: { halign: "right" },
          2: { halign: "right" },
          3: { halign: "right" },
          4: { halign: "right" },
        },
    })

    // Save the PDF
    doc.save(`jobs-schedule-${new Date().toISOString().split("T")[0]}.pdf`)
  }

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

  return (
    <Card className="overflow-hidden">
      <div className="bg-muted/50 flex flex-row p-4 items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Scheduled Jobs ({jobs.length})</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <span className="font-semibold text-foreground">{isPasting ? "Total Quantity" : "Total Sheets"}:</span>
            <span className="ml-4 text-lg font-bold text-foreground">{totalQuantity.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              {isPasting && <TableHead className="text-right">Type</TableHead>}
              <TableHead className="text-right">{isPasting ? "Quantity" : "Sheet Count"}</TableHead>
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
                {isPasting && (
                  <TableCell className="text-right text-sm capitalize">
                    {job.pastingSubType === "side" ? "Side" : "Bottom"}
                  </TableCell>
                )}
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
          <span className="font-semibold text-foreground">Total Jobs Time:</span>
          <span className="ml-4 text-xl font-bold text-primary">{totalTime.toFixed(1)} min</span>
        </div>
      </div>
      <div className="flex justify-end p-4 pt-0">
        <Button variant="outline" size="sm" onClick={exportToPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>
    </Card>
  )
}
