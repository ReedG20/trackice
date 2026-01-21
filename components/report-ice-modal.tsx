"use client"

import * as React from "react"
import { AddressAutofill } from "@mapbox/search-js-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Location01Icon,
  Calendar03Icon,
  UserMultiple02Icon,
  Car01Icon,
  TextIcon,
  Navigation03Icon,
} from "@hugeicons/core-free-icons"

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

interface ReportIceModalProps {
  children: React.ReactElement
}

export function ReportIceModal({ children }: ReportIceModalProps) {
  const [open, setOpen] = React.useState(false)
  const [address, setAddress] = React.useState("")
  const [coordinates, setCoordinates] = React.useState<[number, number] | null>(
    null
  )
  const [dateTime, setDateTime] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [agentCount, setAgentCount] = React.useState("")
  const [vehicleCount, setVehicleCount] = React.useState("")
  const [isLocating, setIsLocating] = React.useState(false)

  // Set default date/time to now when modal opens
  React.useEffect(() => {
    if (open) {
      const now = new Date()
      // Format for datetime-local input: YYYY-MM-DDTHH:MM
      const formatted = now.toISOString().slice(0, 16)
      setDateTime(formatted)
    }
  }, [open])

  // Handle address selection from Mapbox autofill
  const handleRetrieve = React.useCallback(
    (res: { features: Array<{ properties: Record<string, unknown>; geometry: { coordinates: number[] } }> }) => {
      const feature = res.features[0]
      if (feature) {
        const props = feature.properties
        const fullAddress =
          (props.full_address as string) ||
          (props.place_name as string) ||
          ""
        setAddress(fullAddress)
        const coords = feature.geometry.coordinates
        if (coords.length >= 2) {
          setCoordinates([coords[0], coords[1]])
        }
      }
    },
    []
  )

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoordinates([longitude, latitude])

        // Reverse geocode using Mapbox
        try {
          const response = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${longitude}&latitude=${latitude}&access_token=${MAPBOX_ACCESS_TOKEN}`
          )
          const data = await response.json()
          if (data.features && data.features.length > 0) {
            const feature = data.features[0]
            setAddress(
              feature.properties.full_address ||
                feature.properties.place_name ||
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            )
          } else {
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error)
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
        }
        setIsLocating(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        alert("Unable to get your location. Please enter address manually.")
        setIsLocating(false)
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission (skeleton - just close modal)
    console.log({
      address,
      coordinates,
      dateTime,
      details,
      agentCount,
      vehicleCount,
    })
    setOpen(false)
    // Reset form
    setAddress("")
    setCoordinates(null)
    setDetails("")
    setAgentCount("")
    setVehicleCount("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report ICE Activity</DialogTitle>
          <DialogDescription>
            Help protect your community by reporting ICE activity. All reports
            are anonymous.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Address Input with Mapbox Autofill */}
            <Field>
              <FieldLabel htmlFor="address">
                <HugeiconsIcon
                  icon={Location01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Location
              </FieldLabel>
              <div className="flex gap-2">
                <AddressAutofill
                  accessToken={MAPBOX_ACCESS_TOKEN}
                  onRetrieve={handleRetrieve}
                  options={{
                    language: "en",
                    country: "US",
                  }}
                >
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    autoComplete="street-address"
                    className="flex-1"
                    required
                  />
                </AddressAutofill>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  title="Use current location"
                >
                  <HugeiconsIcon
                    icon={Navigation03Icon}
                    strokeWidth={2}
                    className={`size-4 ${isLocating ? "animate-pulse" : ""}`}
                  />
                </Button>
              </div>
              <FieldDescription>
                Street address where activity was observed.
              </FieldDescription>
            </Field>

            {/* Date/Time Picker */}
            <Field>
              <FieldLabel htmlFor="datetime">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Date & Time
              </FieldLabel>
              <Input
                id="datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
              />
              <FieldDescription>
                When did you observe the activity?
              </FieldDescription>
            </Field>

            {/* Details */}
            <Field>
              <FieldLabel htmlFor="details">
                <HugeiconsIcon
                  icon={TextIcon}
                  strokeWidth={2}
                  className="size-4"
                />
                Details
                <span className="text-muted-foreground font-normal ml-1">
                  (optional)
                </span>
              </FieldLabel>
              <Textarea
                id="details"
                placeholder="Describe what you observed (e.g., agents approaching building, checkpoint setup, etc.)"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
              />
            </Field>

            {/* Agent and Vehicle Counts */}
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="agents">
                  <HugeiconsIcon
                    icon={UserMultiple02Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Agents
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  id="agents"
                  type="number"
                  min="0"
                  placeholder="~5"
                  value={agentCount}
                  onChange={(e) => setAgentCount(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="vehicles">
                  <HugeiconsIcon
                    icon={Car01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Vehicles
                  <span className="text-muted-foreground font-normal ml-1">
                    (optional)
                  </span>
                </FieldLabel>
                <Input
                  id="vehicles"
                  type="number"
                  min="0"
                  placeholder="~2"
                  value={vehicleCount}
                  onChange={(e) => setVehicleCount(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Submit Report</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
