"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { addTimeSpan } from "@/lib/store/deals"


export function DatePicker({ selectedDealId }: { selectedDealId: string }) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [time, setTime] = React.useState("10:30:00")
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState("")

  const handleSave = async () => {
    if (!date) {
      setMessage("⚠️ Please select a date first.")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      // Combine date and time into a single timestamp
      const [hours, minutes, seconds] = time.split(":").map(Number)
      const combinedDate = new Date(date)
      combinedDate.setHours(hours, minutes, seconds || 0)

      // Call your backend query
      const result = await addTimeSpan({
        dealId: selectedDealId,
        timeSpan: combinedDate,
      })

      if (result.success) {
        setMessage("✅ Time span created successfully!")
      } else {
        setMessage("❌ " + result.message)
      }
    } catch (error) {
      console.error("TimeSpan Error:", error)
      setMessage("❌ Something went wrong while saving.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Date Picker */}
        <div className="flex flex-col gap-3">
          <Label htmlFor="date-picker" className="px-1">Date</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-32 justify-between font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setDate(date)
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Time Picker */}
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker" className="px-1">Time</Label>
          <Input
            type="time"
            id="time-picker"
            step="1"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save Time Span"}
      </Button>

      {/* Feedback message */}
      {message && (
        <p
          className={`text-sm ${
            message.startsWith("✅")
              ? "text-green-600"
              : message.startsWith("⚠️")
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  )
}
