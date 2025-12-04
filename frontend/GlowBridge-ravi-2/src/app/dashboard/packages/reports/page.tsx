"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 🧩 Define types matching backend response
interface Appointment {
  id: number
  customerName: string
  date: string
  status: string
}

interface PackageReport {
  package: {
    id: number
    name: string
    services: { name: string }[]
    discount: number
    final_price: number
  }
  appointmentCount: number
  appointments: Appointment[]
}

export default function PackageReportsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get("packageId")

  const [reports, setReports] = useState<PackageReport[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Fetch real data from backend
  useEffect(() => {
  const fetchReports = async () => {
    try {
      setLoading(true)
      const url = packageId
        ? `http://localhost:3005/reports/packages?package_id=${packageId}`
        : `http://localhost:3005/reports/packages`

      const res = await fetch(url)
      const data = await res.json()
      setReports(data.data) // Adjust depending on your backend JSON structure
    } catch (err) {
      console.error('Failed to fetch package reports:', err)
    } finally {
      setLoading(false)
    }
  }

  fetchReports()
}, [packageId])


  // ✅ Handle CSV download
  const handleDownloadReport = () => {
    if (!reports.length) return

    let csvContent = "Package,Services,Discount (%),Price ($),Appointments\n"

    reports.forEach((r) => {
      const pkg = r.package
      csvContent += `"${pkg.name}","${pkg.services.map((s) => s.name).join(", ")}",${pkg.discount},${pkg.final_price},${r.appointmentCount}\n`
    })

    csvContent += "\n\nAppointment Details\n"
    csvContent += "Package,Customer Name,Date,Status\n"

    reports.forEach((r) => {
      r.appointments.forEach((apt) => {
        csvContent += `"${r.package.name}","${apt.customerName}","${apt.date}","${apt.status}"\n`
      })
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `packages_report_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/packages")}
              className="hover:bg-blue-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Packages
            </Button>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Packages Report
          </h1>
          <p className="text-muted-foreground mt-2">
            Detailed report of packages, services, pricing, and appointments
          </p>
        </div>

        <Button
          onClick={handleDownloadReport}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
          disabled={!reports.length}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Packages Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Packages Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading package reports...</p>
          ) : reports.length === 0 ? (
            <p>No package report data found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Package</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Discount (%)</TableHead>
                  <TableHead>Price ($)</TableHead>
                  <TableHead>Appointments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((r) => (
                  <TableRow key={r.package.id}>
                    <TableCell className="font-medium">{r.package.name}</TableCell>
                    <TableCell>{r.package.services.map((s) => s.name).join(", ")}</TableCell>
                    <TableCell>{r.package.discount}%</TableCell>
                    <TableCell>${r.package.final_price.toFixed(2)}</TableCell>
                    <TableCell>{r.appointmentCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
