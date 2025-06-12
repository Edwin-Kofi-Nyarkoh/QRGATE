"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface CountdownProps {
  date: Date
}

export function EventCountdown({ date }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +date - +new Date()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [date])

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      <CountdownItem value={timeLeft.days} label="DAYS" />
      <CountdownItem value={timeLeft.hours} label="HOURS" />
      <CountdownItem value={timeLeft.minutes} label="MINS" />
      <CountdownItem value={timeLeft.seconds} label="SECS" />
    </div>
  )
}

function CountdownItem({ value, label }: { value: number; label: string }) {
  return (
    <Card>
      <CardContent className="p-2">
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </CardContent>
    </Card>
  )
}
