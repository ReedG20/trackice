"use client";

import { useEffect, useCallback, useState } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  UserMultiple02Icon,
  Car01Icon,
  Cancel01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
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
  images?: Id<"_storage">[];
  createdAt: number;
}

// Component to display a single image with loading state
function ReportImage({ 
  storageId, 
  onClick,
  className = ""
}: { 
  storageId: Id<"_storage">
  onClick?: () => void
  className?: string
}) {
  const imageUrl = useQuery(api.reports.getImageUrl, { storageId });
  
  if (!imageUrl) {
    return <Skeleton className={className} />;
  }
  
  return (
    <img 
      src={imageUrl} 
      alt="Report" 
      className={`${className} cursor-pointer`}
      onClick={onClick}
    />
  );
}

// Lightbox dialog for viewing images full-size
function ImageLightbox({
  images,
  initialIndex,
  open,
  onClose,
}: {
  images: Id<"_storage">[];
  initialIndex: number;
  open: boolean;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Reset index when opening with a new initial index
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const currentImageUrl = useQuery(
    api.reports.getImageUrl, 
    images[currentIndex] ? { storageId: images[currentIndex] } : "skip"
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/95 border-none">
        <DialogTitle className="sr-only">Image viewer</DialogTitle>
        <div className="relative flex items-center justify-center min-h-[60vh]">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-2 right-2 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-5" />
          </Button>
          
          {/* Image */}
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={`Image ${currentIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain"
            />
          ) : (
            <Skeleton className="w-96 h-64" />
          )}
          
          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={goToPrevious}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={goToNext}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-6" />
              </Button>
              
              {/* Image counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                {currentIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  const hasDetails = report.details || report.agentCount || report.vehicleCount;
  const hasImages = report.images && report.images.length > 0;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
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

          {/* Image Carousel */}
          {hasImages && (
            <div className="px-4 pb-3">
              {report.images.length === 1 ? (
                <ReportImage
                  storageId={report.images[0]}
                  onClick={() => openLightbox(0)}
                  className="w-full h-32 rounded-md object-cover"
                />
              ) : (
                <Carousel className="w-full" opts={{ loop: true }}>
                  <CarouselContent className="-ml-2">
                    {report.images.map((storageId, index) => (
                      <CarouselItem key={storageId} className="pl-2 basis-4/5">
                        <ReportImage
                          storageId={storageId}
                          onClick={() => openLightbox(index)}
                          className="w-full h-32 rounded-md object-cover"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-1 size-6" />
                  <CarouselNext className="right-1 size-6" />
                </Carousel>
              )}
            </div>
          )}

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

      {/* Image Lightbox */}
      {hasImages && (
        <ImageLightbox
          images={report.images}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
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
