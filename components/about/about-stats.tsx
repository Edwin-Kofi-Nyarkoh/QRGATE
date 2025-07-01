"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { Calendar, Users, Award, Target } from 'lucide-react'

interface AboutStatsProps {
  eventsHosted?: number
  happyCustomers?: number
  teamSize?: number
  founded?: string
}

export function AboutStats({ 
  eventsHosted = 150, 
  happyCustomers = 5000, 
  teamSize = 25, 
  founded = "2020" 
}: AboutStatsProps) {
  const stats = [
    {
      icon: Calendar,
      value: `${eventsHosted}+`,
      label: "Events Hosted"
    },
    {
      icon: Users,
      value: `${happyCustomers}+`,
      label: "Happy Customers"
    },
    {
      icon: Award,
      value: `${teamSize}+`,
      label: "Team Members"
    },
    {
      icon: Target,
      value: `Since ${founded}`,
      label: "Years of Excellence"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <IconComponent className="w-8 h-8 mx-auto text-primary mb-2" />
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardHeader>
          </Card>
        )
      })}
    </div>
  )
}