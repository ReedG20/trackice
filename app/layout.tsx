import type { Metadata } from "next";
import { Geist, Geist_Mono, DM_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrackIce",
  description: "Track ice conditions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Map fills the entire background */}
          <div className="fixed inset-0 z-0">
            {children}
          </div>
          
          {/* Sidebar overlays on top */}
          <SidebarProvider className="sidebar-overlay fixed inset-0 z-10 min-h-0! pointer-events-none">
            <AppSidebar className="pointer-events-auto" />
            <SidebarTrigger className="pointer-events-auto fixed top-4 left-4 z-20" />
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
