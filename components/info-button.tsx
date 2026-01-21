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
import { useState } from "react";

export function InfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
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
        <span className="sr-only">About TrackIce</span>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>hey!</AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-4">
            <p>
              like you, i would prefer our democracy doesn&apos;t turn into a fascist
              regime within the next 3 years.
            </p>
            <p>
              ...so i built a tool that tracks ice sightings from across the
              internet, and puts it all on one map.
            </p>
            <p>
              if you&apos;d like to be alerted if ice enters <em>your</em> neighborhood,
              you can subscribe to location-based SMS and/or email
              notifications.
            </p>
            <p>stay safe!</p>
            <p className="font-semibold">fuck ice.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
