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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Location01Icon, Calendar03Icon, Mail01Icon, Alert02Icon } from "@hugeicons/core-free-icons"

// Placeholder reporting data
const mockReportings = [
  {
    id: 1,
    location: "Downtown Los Angeles, CA",
    imageUrl: "/placeholder-1.jpg",
    timeAgo: "12 min ago",
    verified: true,
  },
  {
    id: 2,
    location: "Mission District, San Francisco",
    imageUrl: "/placeholder-2.jpg",
    timeAgo: "2 hrs ago",
    verified: true,
  },
  {
    id: 3,
    location: "East Austin, TX",
    imageUrl: "/placeholder-3.jpg",
    timeAgo: "3 hrs ago",
    verified: false,
  },
  {
    id: 4,
    location: "Jackson Heights, Queens, NY",
    imageUrl: "/placeholder-4.jpg",
    timeAgo: "5 hrs ago",
    verified: true,
  },
  {
    id: 5,
    location: "Pilsen, Chicago, IL",
    imageUrl: "/placeholder-5.jpg",
    timeAgo: "8 hrs ago",
    verified: false,
  },
  {
    id: 6,
    location: "Little Havana, Miami, FL",
    imageUrl: "/placeholder-6.jpg",
    timeAgo: "1 day ago",
    verified: true,
  },
]

function ReportingCard({
  location,
  timeAgo,
  verified,
}: {
  location: string
  imageUrl: string
  timeAgo: string
  verified: boolean
}) {
  return (
    <div className="group flex gap-3 p-2 rounded-md hover:bg-sidebar-accent cursor-pointer transition-colors">
      {/* Placeholder image */}
      <Skeleton className="size-14 rounded-md shrink-0" />
      
      {/* Content */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm font-medium leading-tight truncate">
            {location}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          {verified && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              Verified
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({ className }: { className?: string }) {
  return (
    <Sidebar variant="floating" className={className}>
      <SidebarHeader>
        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pt-1">
          <div className="size-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TI</span>
          </div>
          <span className="font-semibold text-lg tracking-tight">TrackIce</span>
        </div>
      </SidebarHeader>
      
      <SidebarSeparator className="mx-0" />
      
      <SidebarContent>
        {/* Report Button */}
        <SidebarGroup>
          <SidebarGroupContent>
            <Button className="w-full" size="sm">
              <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
              Report ICE
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
        
        {/* Search and Filters */}
        <SidebarGroup>
          <SidebarGroupContent className="space-y-2">
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
        <SidebarGroup>
          <div className="px-2 py-2">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Reportings
            </span>
          </div>
          <SidebarGroupContent className="space-y-1 px-0">
            {mockReportings.map((reporting) => (
              <ReportingCard key={reporting.id} {...reporting} />
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        
        {/* Subscribe CTA */}
        <div className="p-3 bg-muted/50 rounded-md space-y-2.5">
          <div className="flex items-start gap-2">
            <HugeiconsIcon 
              icon={Mail01Icon} 
              strokeWidth={2} 
              className="size-4 text-primary mt-0.5 shrink-0" 
            />
            <div className="space-y-0.5">
              <p className="text-sm font-medium leading-tight">Stay safe!</p>
              <p className="text-xs text-muted-foreground leading-snug">
                Subscribe to SMS or email alerts for your area.
              </p>
            </div>
          </div>
          <Button size="sm" className="w-full">
            Get Alerts
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
