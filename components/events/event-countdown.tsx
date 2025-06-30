"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CountdownProps {
  startDate: Date;
  endDate: Date;
}

export function EventCountdown({ startDate, endDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [status, setStatus] = useState<"upcoming" | "live" | "ended">(
    "upcoming"
  );

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Determine event status
      if (now < start) {
        setStatus("upcoming");
        const difference = +start - +now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        }
      } else if (now >= start && now <= end) {
        setStatus("live");
        const difference = +end - +now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
          });
        }
      } else {
        setStatus("ended");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [startDate, endDate]);

  const getStatusText = () => {
    switch (status) {
      case "upcoming":
        return "Starts in";
      case "live":
        return "Ends in";
      case "ended":
        return "Event Ended";
      default:
        return "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={`font-bold text-lg ${
          status === "live"
            ? "text-green-600"
            : status === "ended"
            ? "text-red-600"
            : "text-blue-600"
        }`}
      >
        {getStatusText()}
      </span>
      {status !== "ended" && (
        <div className="grid grid-cols-4 gap-2 text-center">
          <CountdownItem value={timeLeft.days} label="DAYS" />
          <CountdownItem value={timeLeft.hours} label="HOURS" />
          <CountdownItem value={timeLeft.minutes} label="MINS" />
          <CountdownItem value={timeLeft.seconds} label="SECS" />
        </div>
      )}
    </div>
  );
}

function CountdownItem({ value, label }: { value: number; label: string }) {
  return (
    <Card>
      <CardContent className="p-2">
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </CardContent>
    </Card>
  );
}
