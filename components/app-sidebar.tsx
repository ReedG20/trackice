import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar({ className }: { className?: string }) {
  return (
    <Sidebar variant="floating" className={className}>
      <SidebarHeader />
      <SidebarContent />
      <SidebarFooter />
    </Sidebar>
  )
}
