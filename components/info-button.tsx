"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useState, useEffect } from "react";

const STORAGE_KEY = "trackice-info-seen";

export function InfoButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the info modal before
    const hasSeenInfo = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenInfo) {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    // Mark as seen when modal is closed
    if (!isOpen) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <Button
        variant="outline"
        size="icon"
        className="bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(true)}
      >
        <HugeiconsIcon
          icon={InformationCircleIcon}
          strokeWidth={2}
          className="size-[1.2rem]"
        />
        <span className="sr-only">About TrackICE</span>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>hey!</AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-4">
            <span className="block">like you, i would prefer our democracy doesn&apos;t turn into a fascist regime within the next 3 years.</span>
            <span className="block">...so i built a tool that tracks ICE sightings from across the internet, and puts them all on one map.</span>
            <span className="block">if you&apos;d like to be alerted if ICE enters <em>your</em> neighborhood, you can subscribe to location-based SMS and/or email notifications.</span>
            <span className="block">stay safe!</span>
            <span className="block font-semibold">fuck ICE.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
