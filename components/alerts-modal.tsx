"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  SmartPhone01Icon,
  Mail01Icon,
  Location01Icon,
  Radar01Icon,
} from "@hugeicons/core-free-icons"
import { Slider } from "@/components/ui/slider"

interface AlertsModalProps {
  children: React.ReactElement
}

export function AlertsModal({ children }: AlertsModalProps) {
  const [open, setOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("sms")
  const [radius, setRadius] = React.useState([10])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Alerts</DialogTitle>
          <DialogDescription>
            Subscribe to receive real-time alerts about ICE activity in your
            area.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="sms" className="flex-1">
              <HugeiconsIcon
                icon={SmartPhone01Icon}
                strokeWidth={2}
                className="size-4"
              />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="flex-1">
              <HugeiconsIcon
                icon={Mail01Icon}
                strokeWidth={2}
                className="size-4"
              />
              Email
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit}>
            <TabsContent value="sms" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                  <FieldDescription>
                    We&apos;ll send text alerts to this number.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="sms-zipcode">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                    ZIP / Postal Code
                  </FieldLabel>
                  <Input
                    id="sms-zipcode"
                    type="text"
                    placeholder="90210"
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    required
                  />
                  <FieldDescription>
                    Enter your ZIP code to receive alerts for your area.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </TabsContent>

            <TabsContent value="email" className="mt-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                  />
                  <FieldDescription>
                    We&apos;ll send email alerts to this address.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="email-zipcode">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                    ZIP / Postal Code
                  </FieldLabel>
                  <Input
                    id="email-zipcode"
                    type="text"
                    placeholder="90210"
                    pattern="[0-9]{5}(-[0-9]{4})?"
                    required
                  />
                  <FieldDescription>
                    Enter your ZIP code to receive alerts for your area.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </TabsContent>

            <div className="mt-6 pt-4 border-t space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="radius"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <HugeiconsIcon
                    icon={Radar01Icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  Alert Radius
                </label>
                <span className="text-sm font-medium tabular-nums">
                  {radius[0]} {radius[0] === 1 ? "mile" : "miles"}
                </span>
              </div>
              <Slider
                id="radius"
                value={radius}
                onValueChange={(value) =>
                  setRadius(Array.isArray(value) ? value : [value])
                }
                min={1}
                max={25}
                step={1}
              />
              <p className="text-sm text-muted-foreground">
                Get notified about activity within this distance from your ZIP
                code.
              </p>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit" className="w-full sm:w-auto">
                Subscribe to Alerts
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
