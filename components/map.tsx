"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const LIGHT_STYLE = "mapbox://styles/mapbox/light-v11";
const DARK_STYLE = "mapbox://styles/mapbox/dark-v11";

interface MapBounds {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function Map() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const { resolvedTheme } = useTheme();
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  // Fetch reports within the current map bounds
  const reports = useQuery(
    api.reports.getReportsByBounds,
    bounds ? bounds : "skip"
  );

  // Update bounds when map moves
  const updateBounds = useCallback(() => {
    if (!mapRef.current) return;
    const mapBounds = mapRef.current.getBounds();
    setBounds({
      west: mapBounds.getWest(),
      south: mapBounds.getSouth(),
      east: mapBounds.getEast(),
      north: mapBounds.getNorth(),
    });
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    const style = resolvedTheme === "dark" ? DARK_STYLE : LIGHT_STYLE;

    if (mapRef.current) {
      mapRef.current.setStyle(style);
      return;
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style,
      center: [-122.4194, 37.7749],
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Set initial bounds after map loads
    mapRef.current.on("load", updateBounds);

    // Update bounds on map move
    mapRef.current.on("moveend", updateBounds);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [resolvedTheme, updateBounds]);

  // Update markers when reports change
  useEffect(() => {
    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (!reports || !mapRef.current) return;

    // Add new markers
    reports.forEach((report) => {
      if (!mapRef.current) return;

      // Create a custom marker element
      const el = document.createElement("div");
      el.className = "report-marker";
      el.style.width = "24px";
      el.style.height = "24px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#ef4444";
      el.style.border = "3px solid #ffffff";
      el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      // Create popup with report info
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(`
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; font-weight: 600; font-size: 14px;">${report.address}</h3>
          <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">
            ${new Date(report.dateTime).toLocaleString()}
          </p>
          ${report.details ? `<p style="margin: 8px 0 0 0; font-size: 12px;">${report.details}</p>` : ""}
          ${report.agentCount ? `<p style="margin: 4px 0 0 0; font-size: 12px;">Agents: ~${report.agentCount}</p>` : ""}
          ${report.vehicleCount ? `<p style="margin: 4px 0 0 0; font-size: 12px;">Vehicles: ~${report.vehicleCount}</p>` : ""}
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .setPopup(popup)
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [reports]);

  return <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />;
}
