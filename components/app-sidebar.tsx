"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarSeparator,
  SidebarInput,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertsModal } from "@/components/alerts-modal"
import { ReportIceModal } from "@/components/report-ice-modal"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Location01Icon, Calendar03Icon, Alert02Icon, Target01Icon, SmartPhone01Icon } from "@hugeicons/core-free-icons"

function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`
  if (days === 1) return "1 day ago"
  return `${days} days ago`
}

function ReportingCard({
  address,
  createdAt,
}: {
  address: string
  createdAt: number
}) {
  return (
    <div className="group flex gap-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer transition-colors">
      {/* Placeholder image */}
      <Skeleton className="size-14 rounded-md shrink-0" />
      
      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-tight truncate">
            {address}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{formatTimeAgo(createdAt)}</span>
        </div>
      </div>
    </div>
  )
}

function ReportingCardSkeleton() {
  return (
    <div className="flex gap-3 p-2">
      <Skeleton className="size-14 rounded-md shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function AppSidebar({ className }: { className?: string }) {
  const reports = useQuery(api.reports.getRecentReports, { limit: 20 })

  return (
    <Sidebar variant="floating" className={className}>
      <SidebarHeader>
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pt-1">
          <div className="size-8 rounded-md bg-primary flex items-center justify-center">
            <HugeiconsIcon icon={Target01Icon} strokeWidth={2} className="size-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight">TrackICE</span>
        </div>
      </SidebarHeader>
      
      <SidebarSeparator className="mx-0" />
      
      <SidebarContent>
        {/* Report Button, Search and Filters */}
        <SidebarGroup>
          <SidebarGroupContent className="space-y-2">
            <ReportIceModal>
              <Button className="w-full" size="sm">
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
                Report ICE
              </Button>
            </ReportIceModal>
            {/* Search bar */}
            <div className="relative">
              <HugeiconsIcon 
                icon={Search01Icon} 
                strokeWidth={2} 
                className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" 
              />
              <SidebarInput 
                placeholder="Search location..." 
                className="pl-8"
              />
            </div>
            
            {/* Filter row */}
            <div className="flex gap-2">
              <Select defaultValue="25">
                <SelectTrigger size="sm" className="flex-1 h-8 text-xs">
                  <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className="size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 miles</SelectItem>
                  <SelectItem value="10">10 miles</SelectItem>
                  <SelectItem value="25">25 miles</SelectItem>
                  <SelectItem value="50">50 miles</SelectItem>
                  <SelectItem value="100">100 miles</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="24h">
                <SelectTrigger size="sm" className="flex-1 h-8 text-xs">
                  <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator className="mx-0" />
        
        {/* Recent Reportings */}
        <SidebarGroup className="pt-0">
          <div className="px-2 pb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Reportings
            </span>
          </div>
          <SidebarGroupContent className="space-y-1 px-0">
            {reports === undefined ? (
              // Loading state
              <>
                <ReportingCardSkeleton />
                <ReportingCardSkeleton />
                <ReportingCardSkeleton />
              </>
            ) : reports.length === 0 ? (
              // Empty state
              <div className="px-2 py-4 text-center">
                <p className="text-sm text-muted-foreground">No reports yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to report ICE activity</p>
              </div>
            ) : (
              // Reports list
              reports.map((report) => (
                <ReportingCard 
                  key={report._id} 
                  address={report.address}
                  createdAt={report.createdAt}
                />
              ))
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        
        {/* Subscribe CTA */}
        <div className="p-3 bg-muted/50 rounded-md space-y-2.5">
          <div className="space-y-0.5">
            <p className="text-sm font-medium leading-tight">Stay safe!</p>
            <p className="text-xs text-muted-foreground leading-snug">
              Subscribe to SMS or email alerts for your area.
            </p>
          </div>
          <AlertsModal>
            <Button size="sm" className="w-full">
              <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={2} className="size-4" />
              Get Alerts
            </Button>
          </AlertsModal>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
