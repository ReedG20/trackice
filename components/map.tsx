"use client";

import { useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Map, Marker, Popup, NavigationControl, useMap } from "react-map-gl/mapbox";
import { useReport } from "@/components/report-context";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  UserMultiple02Icon,
  Car01Icon,
  Cancel01Icon,
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

function ReportMarker() {
  return (
    <div className="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
      {/* Outer pulse animation */}
      <span className="absolute size-8 rounded-full bg-primary/30 animate-ping" />
      {/* Main marker */}
      <span className="relative size-6 rounded-full bg-primary border-[3px] border-white shadow-lg" />
    </div>
  );
}

function ReportPopup({
  report,
  onClose,
}: {
  report: Report;
  onClose: () => void;
}) {
  const hasDetails = report.details || report.agentCount || report.vehicleCount;

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
      <Card size="sm" className="w-[280px] shadow-md">
        <CardHeader>
          <CardTitle>{report.address}</CardTitle>
          <CardDescription className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={Calendar03Icon}
              strokeWidth={2}
              className="size-3"
            />
            {new Date(report.dateTime).toLocaleString()}
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>

        {hasDetails && (
          <CardContent className="border-t border-border pt-4 space-y-3">
            {report.details && (
              <p className="text-sm text-muted-foreground">
                {report.details}
              </p>
            )}

            {(report.agentCount || report.vehicleCount) && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {report.agentCount && (
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={UserMultiple02Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                    <span>~{report.agentCount} agents</span>
                  </div>
                )}
                {report.vehicleCount && (
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon
                      icon={Car01Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                    <span>~{report.vehicleCount} vehicles</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </Popup>
  );
}

function MapContent() {
  const { selectedReport, setSelectedReport, clearSelectedReport } = useReport();
  const { current: map } = useMap();

  // Fetch recent reports - simpler than bounds-based for now
  const reports = useQuery(api.reports.getRecentReports, { limit: 100 });

  const handleMarkerClick = useCallback((report: Report) => {
    setSelectedReport(report);
  }, [setSelectedReport]);

  // Fly to selected report when it changes (e.g., from sidebar click)
  useEffect(() => {
    if (selectedReport && map) {
      map.flyTo({
        center: [selectedReport.longitude, selectedReport.latitude],
        zoom: 14,
        duration: 1500,
      });
    }
  }, [selectedReport, map]);

  return (
    <>
      <NavigationControl position="top-right" />

      {reports?.map((report) => (
        <Marker
          key={report._id}
          longitude={report.longitude}
          latitude={report.latitude}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleMarkerClick(report);
          }}
        >
          <ReportMarker />
        </Marker>
      ))}

      {selectedReport && (
        <ReportPopup report={selectedReport} onClose={clearSelectedReport} />
      )}
    </>
  );
}

export function MapView() {
  const { resolvedTheme } = useTheme();
  const mapStyle = resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE;

  return (
    <Map
      id="main-map"
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
      <MapContent />
    </Map>
  );
}
