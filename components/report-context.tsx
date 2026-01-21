"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { Id } from "@/convex/_generated/dataModel"

interface Report {
  _id: string
  address: string
  longitude: number
  latitude: number
  dateTime: string
  details?: string
  agentCount?: number
  vehicleCount?: number
  images?: Id<"_storage">[]
  createdAt: number
}

interface ReportContextType {
  selectedReport: Report | null
  setSelectedReport: (report: Report | null) => void
  clearSelectedReport: () => void
}

const ReportContext = createContext<ReportContextType | undefined>(undefined)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const clearSelectedReport = useCallback(() => {
    setSelectedReport(null)
  }, [])

  return (
    <ReportContext.Provider value={{ selectedReport, setSelectedReport, clearSelectedReport }}>
      {children}
    </ReportContext.Provider>
  )
}

export function useReport() {
  const context = useContext(ReportContext)
  if (context === undefined) {
    throw new Error("useReport must be used within a ReportProvider")
  }
  return context
}
