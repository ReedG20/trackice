"use client";

import { useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Map, Marker, Popup, NavigationControl } from "react-map-gl/mapbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Calendar03Icon,
  UserMultiple02Icon,
  Car01Icon,
} from "@hugeicons/core-free-icons";
import "mapbox-gl/dist/mapbox-gl.css";

const LIGHT_STYLE = "mapbox://styles/mapbox/light-v11";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

interface Report {
  _id: string;
  address: string;
  longitude: number;
  latitude: number;
  dateTime: string;
  details?: string;
  agentCount?: number;
  vehicleCount?: number;
  createdAt: number;
}

function ReportMarker({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 focus:outline-none"
    >
      {/* Outer pulse animation */}
      <span className="absolute size-8 rounded-full bg-red-500/30 animate-ping" />
      {/* Main marker */}
      <span className="relative size-6 rounded-full bg-red-500 border-[3px] border-white shadow-lg" />
    </button>
  );
}

function ReportPopup({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  return (
    <Popup
      longitude={report.longitude}
      latitude={report.latitude}
      anchor="bottom"
      onClose={onClose}
      closeButton={false}
      offset={20}
      className="report-popup"
    >
      <Card className="border-0 shadow-none min-w-[240px] max-w-[280px]">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm font-semibold leading-tight">
              {report.address}
            </CardTitle>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground text-lg leading-none"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={Calendar03Icon}
              strokeWidth={2}
              className="size-3.5"
            />
            {new Date(report.dateTime).toLocaleString()}
          </div>

          {report.details && (
            <p className="text-xs text-foreground">{report.details}</p>
          )}

          <div className="flex gap-3">
            {report.agentCount && (
              <Badge variant="secondary" className="text-xs gap-1">
                <HugeiconsIcon
                  icon={UserMultiple02Icon}
                  strokeWidth={2}
                  className="size-3"
                />
                ~{report.agentCount} agents
              </Badge>
            )}
            {report.vehicleCount && (
              <Badge variant="secondary" className="text-xs gap-1">
                <HugeiconsIcon
                  icon={Car01Icon}
                  strokeWidth={2}
                  className="size-3"
                />
                ~{report.vehicleCount} vehicles
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Popup>
  );
}

export function MapView() {
  const { resolvedTheme } = useTheme();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Fetch recent reports - simpler than bounds-based for now
  const reports = useQuery(api.reports.getRecentReports, { limit: 100 });

  const handleMarkerClick = useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  const handlePopupClose = useCallback(() => {
    setSelectedReport(null);
  }, []);

  const mapStyle = resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE;

  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: -122.4194,
        latitude: 37.7749,
        zoom: 10,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={mapStyle}
      reuseMaps
    >
      <NavigationControl position="top-right" />

      {reports?.map((report) => (
        <Marker
          key={report._id}
          longitude={report.longitude}
          latitude={report.latitude}
          anchor="center"
        >
          <ReportMarker onClick={() => handleMarkerClick(report)} />
        </Marker>
      ))}

      {selectedReport && (
        <ReportPopup report={selectedReport} onClose={handlePopupClose} />
      )}
    </Map>
  );
}
