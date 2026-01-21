"use client"

import * as React from "react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
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
  Cancel01Icon,
  Loading03Icon,
  Image01Icon,
  Add01Icon,
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

interface SelectedImage {
  file: File
  preview: string
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
  const [isSearching, setIsSearching] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedImages, setSelectedImages] = React.useState<SelectedImage[]>([])

  const createReport = useMutation(api.reports.createReport)
  const generateUploadUrl = useMutation(api.reports.generateUploadUrl)
  
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const suggestionsRef = React.useRef<HTMLDivElement>(null)

  // Initialize SearchBoxCore and session token
  const searchBoxRef = React.useRef<SearchBoxCore | null>(null)
  const sessionTokenRef = React.useRef<SessionToken | null>(null)
  
  // Track request version to prevent race conditions
  const requestVersionRef = React.useRef(0)

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
      if (value.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        setIsSearching(false)
        return
      }

      // Show loading state
      setIsSearching(true)

      // Debounce the search
      debounceRef.current = setTimeout(async () => {
        if (!searchBoxRef.current || !sessionTokenRef.current) {
          setIsSearching(false)
          return
        }

        // Increment version for this request
        const currentVersion = ++requestVersionRef.current

        try {
          const response = await searchBoxRef.current.suggest(value, {
            sessionToken: sessionTokenRef.current,
          })

          // Ignore stale responses
          if (currentVersion !== requestVersionRef.current) {
            return
          }

          const newSuggestions = (response.suggestions || []).map((s) => ({
            mapbox_id: s.mapbox_id,
            name: s.name,
            full_address: s.full_address,
            place_formatted: s.place_formatted,
          }))
          setSuggestions(newSuggestions)
          setShowSuggestions(newSuggestions.length > 0)
        } catch (error) {
          // Ignore errors from stale requests
          if (currentVersion !== requestVersionRef.current) {
            return
          }
          console.error("Search failed:", error)
          setSuggestions([])
          setShowSuggestions(false)
        } finally {
          // Only clear loading if this is still the current request
          if (currentVersion === requestVersionRef.current) {
            setIsSearching(false)
          }
        }
      }, 200)
    },
    []
  )

  // Handle selection from suggestions
  const handleSelectSuggestion = React.useCallback(
    async (suggestion: Suggestion) => {
      if (!searchBoxRef.current || !sessionTokenRef.current) return

      // Immediately update UI for instant feedback
      const fullAddress =
        suggestion.full_address ||
        suggestion.place_formatted ||
        suggestion.name
      setAddress(fullAddress)
      setIsVerified(true)
      setSuggestions([])
      setShowSuggestions(false)
      setHighlightedIndex(-1)
      setIsSearching(false)

      // Fetch coordinates in the background
      try {
        const response = await searchBoxRef.current.retrieve(
          { mapbox_id: suggestion.mapbox_id } as Parameters<
            SearchBoxCore["retrieve"]
          >[0],
          { sessionToken: sessionTokenRef.current }
        )
        const feature = response.features?.[0]
        if (feature) {
          setCoordinates([
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
          ])
        }
        // Create new session token for next search
        sessionTokenRef.current = new SessionToken()
      } catch (error) {
        console.error("Retrieve failed:", error)
        // Address is already shown, just log the error
        // Coordinates will be null but form still works
      }
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
    [showSuggestions, suggestions, highlightedIndex, handleSelectSuggestion]
  )

  // Clear selected address
  const handleClearAddress = React.useCallback(() => {
    setAddress("")
    setCoordinates(null)
    setIsVerified(false)
    setSuggestions([])
    setShowSuggestions(false)
    setIsSearching(false)
    // Cancel any pending requests
    requestVersionRef.current++
    // Focus the input after clearing
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

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

  // Handle image selection
  const handleImageSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const remainingSlots = 3 - selectedImages.length
    const filesToAdd = Array.from(files).slice(0, remainingSlots)

    const newImages = filesToAdd.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setSelectedImages(prev => [...prev, ...newImages])
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [selectedImages.length])

  // Remove a selected image
  const handleRemoveImage = React.useCallback((index: number) => {
    setSelectedImages(prev => {
      const newImages = [...prev]
      // Revoke object URL to prevent memory leaks
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }, [])

  // Reset form state
  const resetForm = React.useCallback(() => {
    setAddress("")
    setCoordinates(null)
    setIsVerified(false)
    setSuggestions([])
    setShowSuggestions(false)
    setHighlightedIndex(-1)
    setDateTime("")
    setDetails("")
    setAgentCount("")
    setVehicleCount("")
    setIsSearching(false)
    // Cancel any pending requests
    requestVersionRef.current++
    // Cleanup image previews
    selectedImages.forEach(img => URL.revokeObjectURL(img.preview))
    setSelectedImages([])
  }, [selectedImages])

  // Handle modal open/close state changes
  const handleOpenChange = React.useCallback((newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }, [resetForm])

  // Upload images to Convex storage
  const uploadImages = async (): Promise<Id<"_storage">[]> => {
    const storageIds: Id<"_storage">[] = []
    
    for (const { file } of selectedImages) {
      // Get upload URL
      const uploadUrl = await generateUploadUrl()
      
      // Upload the file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      
      if (!result.ok) {
        throw new Error("Failed to upload image")
      }
      
      const { storageId } = await result.json()
      storageIds.push(storageId)
    }
    
    return storageIds
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!coordinates) {
      alert("Please select a valid location")
      return
    }

    if (selectedImages.length < 1) {
      alert("Please add at least one image")
      return
    }

    setIsSubmitting(true)
    
    try {
      // Upload images first
      const imageIds = await uploadImages()
      
      await createReport({
        address,
        longitude: coordinates[0],
        latitude: coordinates[1],
        dateTime,
        details: details || undefined,
        agentCount: agentCount ? parseInt(agentCount, 10) : undefined,
        vehicleCount: vehicleCount ? parseInt(vehicleCount, 10) : undefined,
        images: imageIds,
      })
      
      handleOpenChange(false)
    } catch (error) {
      console.error("Failed to submit report:", error)
      alert("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
                <InputGroup data-disabled={isVerified || undefined}>
                  <InputGroupInput
                    ref={inputRef}
                    id="address"
                    type="text"
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0 && !isVerified)
                        setShowSuggestions(true)
                    }}
                    autoComplete="off"
                    disabled={isVerified}
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    {isVerified ? (
                      <InputGroupButton
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleClearAddress}
                        title="Clear address"
                      >
                        <HugeiconsIcon
                          icon={Cancel01Icon}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </InputGroupButton>
                    ) : isSearching ? (
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        strokeWidth={2}
                        className="size-4 animate-spin text-muted-foreground"
                      />
                    ) : (
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
                    )}
                  </InputGroupAddon>
                </InputGroup>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && !isVerified && (
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

            {/* Image Upload */}
            <Field>
              <FieldLabel>
                <HugeiconsIcon
                  icon={Image01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
                Photos
              </FieldLabel>
              <div className="space-y-3">
                {/* Image previews */}
                {selectedImages.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {selectedImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative size-20 rounded-md overflow-hidden border bg-muted"
                      >
                        <img
                          src={img.preview}
                          alt={`Selected ${index + 1}`}
                          className="size-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 size-5 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors"
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            strokeWidth={2}
                            className="size-3 text-white"
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add image button */}
                {selectedImages.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full h-20 border-2 border-dashed rounded-md text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      strokeWidth={2}
                      className="size-5"
                    />
                    <span className="text-sm">
                      Add photo {selectedImages.length > 0 && `(${selectedImages.length}/3)`}
                    </span>
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
              <FieldDescription>
                At least one photo is required (up to 3).
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
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !coordinates || selectedImages.length < 1}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
