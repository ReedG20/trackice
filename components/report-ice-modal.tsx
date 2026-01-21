"use client"

import * as React from "react"
import { SearchBoxCore, SessionToken } from "@mapbox/search-js-core"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group"
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
  Tick02Icon,
} from "@hugeicons/core-free-icons"

const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ""

interface Suggestion {
  mapbox_id: string
  name: string
  full_address?: string
  place_formatted?: string
}

interface ReportIceModalProps {
  children: React.ReactElement
}

export function ReportIceModal({ children }: ReportIceModalProps) {
  const [open, setOpen] = React.useState(false)
  const [address, setAddress] = React.useState("")
  const [coordinates, setCoordinates] = React.useState<[number, number] | null>(
    null
  )
  const [isVerified, setIsVerified] = React.useState(false)
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1)
  const [dateTime, setDateTime] = React.useState("")
  const [details, setDetails] = React.useState("")
  const [agentCount, setAgentCount] = React.useState("")
  const [vehicleCount, setVehicleCount] = React.useState("")
  const [isLocating, setIsLocating] = React.useState(false)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const suggestionsRef = React.useRef<HTMLDivElement>(null)

  // Initialize SearchBoxCore and session token
  const searchBoxRef = React.useRef<SearchBoxCore | null>(null)
  const sessionTokenRef = React.useRef<SessionToken | null>(null)

  React.useEffect(() => {
    if (MAPBOX_ACCESS_TOKEN) {
      searchBoxRef.current = new SearchBoxCore({
        accessToken: MAPBOX_ACCESS_TOKEN,
        language: "en",
        country: "US",
      })
      sessionTokenRef.current = new SessionToken()
    }
  }, [])

  // Set default date/time to now when modal opens
  React.useEffect(() => {
    if (open) {
      const now = new Date()
      // Format for datetime-local input: YYYY-MM-DDTHH:MM
      const formatted = now.toISOString().slice(0, 16)
      setDateTime(formatted)
    }
  }, [open])

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search for suggestions
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleAddressChange = React.useCallback(
    (value: string) => {
      setAddress(value)
      // When user types, mark as unverified
      setIsVerified(false)
      setCoordinates(null)
      setHighlightedIndex(-1)

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Don't search for very short inputs
      if (value.length < 3) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      // Debounce the search
      debounceRef.current = setTimeout(async () => {
        if (!searchBoxRef.current || !sessionTokenRef.current) return

        try {
          const response = await searchBoxRef.current.suggest(value, {
            sessionToken: sessionTokenRef.current,
          })
          const newSuggestions = (response.suggestions || []).map((s) => ({
            mapbox_id: s.mapbox_id,
            name: s.name,
            full_address: s.full_address,
            place_formatted: s.place_formatted,
          }))
          setSuggestions(newSuggestions)
          setShowSuggestions(newSuggestions.length > 0)
        } catch (error) {
          console.error("Search failed:", error)
          setSuggestions([])
          setShowSuggestions(false)
        }
      }, 300)
    },
    []
  )

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions || suggestions.length === 0) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          )
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          )
          break
        case "Enter":
          e.preventDefault()
          if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
            handleSelectSuggestion(suggestions[highlightedIndex])
          }
          break
        case "Escape":
          setShowSuggestions(false)
          setHighlightedIndex(-1)
          break
      }
    },
    [showSuggestions, suggestions, highlightedIndex]
  )

  // Handle selection from suggestions
  const handleSelectSuggestion = React.useCallback(
    async (suggestion: Suggestion) => {
      if (!searchBoxRef.current || !sessionTokenRef.current) return

      try {
        const response = await searchBoxRef.current.retrieve(
          { mapbox_id: suggestion.mapbox_id } as Parameters<
            SearchBoxCore["retrieve"]
          >[0],
          { sessionToken: sessionTokenRef.current }
        )
        const feature = response.features?.[0]
        if (feature) {
          const fullAddress =
            suggestion.full_address ||
            suggestion.place_formatted ||
            suggestion.name
          setAddress(fullAddress)
          setCoordinates([
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
          ])
          setIsVerified(true)
          setSuggestions([])
          setShowSuggestions(false)
          setHighlightedIndex(-1)
          // Create new session token for next search
          sessionTokenRef.current = new SessionToken()
        }
      } catch (error) {
        console.error("Retrieve failed:", error)
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
    setShowSuggestions(false)
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
            setIsVerified(true)
          } else {
            setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
            setIsVerified(false)
          }
        } catch (error) {
          console.error("Reverse geocoding failed:", error)
          setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`)
          setIsVerified(false)
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
      isVerified,
      dateTime,
      details,
      agentCount,
      vehicleCount,
    })
    setOpen(false)
    // Reset form
    setAddress("")
    setCoordinates(null)
    setIsVerified(false)
    setSuggestions([])
    setShowSuggestions(false)
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
            {/* Address Input with Custom Mapbox Autocomplete */}
            <Field>
              <FieldLabel htmlFor="address">
                <HugeiconsIcon
                  icon={Location01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Location
              </FieldLabel>
              <div className="relative">
                <InputGroup
                  className={
                    isVerified
                      ? "border-green-500/50 focus-within:border-green-500 focus-within:ring-green-500/30"
                      : ""
                  }
                >
                  <InputGroupInput
                    ref={inputRef}
                    id="address"
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true)
                    }}
                    autoComplete="off"
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    {isVerified && (
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        strokeWidth={2}
                        className="size-4 text-green-500"
                      />
                    )}
                    <InputGroupButton
                      variant="ghost"
                      size="icon-xs"
                      onClick={handleUseCurrentLocation}
                      disabled={isLocating}
                      title="Use current location"
                    >
                      <HugeiconsIcon
                        icon={Navigation03Icon}
                        strokeWidth={2}
                        className={`size-4 ${isLocating ? "animate-pulse" : ""}`}
                      />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-md"
                  >
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.mapbox_id}
                        type="button"
                        className={`flex w-full flex-col gap-0.5 rounded-sm px-2 py-1.5 text-left text-sm outline-none ${
                          index === highlightedIndex
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        onMouseEnter={() => setHighlightedIndex(index)}
                      >
                        <span className="font-medium">{suggestion.name}</span>
                        {suggestion.place_formatted && (
                          <span className="text-xs text-muted-foreground">
                            {suggestion.place_formatted}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <FieldDescription>
                {isVerified ? (
                  <span className="text-green-600 dark:text-green-400">
                    Location verified
                  </span>
                ) : (
                  "Street address where activity was observed."
                )}
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
