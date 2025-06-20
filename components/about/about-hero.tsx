"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"

interface AboutHeroProps {
  story?: string
  mission?: string
  vision?: string
}

export function AboutHero({ 
  story = "Founded with a passion for bringing people together, we started as a small team with big dreams. Our journey began when we realized the power of events to create lasting memories and meaningful connections.",
  mission = "To democratize event management by providing innovative tools that make organizing and attending events seamless and enjoyable for everyone.",
  vision = "To become the world's most trusted platform for event discovery and management, connecting communities through shared experiences."
}: AboutHeroProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
      {/* Image Section */}
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-64 md:h-80">
            <Image 
              src="https://res.cloudinary.com/dggaqzud0/image/upload/v1750455981/generate_an_image_of_gb0tff.png" 
              alt="Cancelled Paper Ticket" 
              fill 
              className="object-cover" 
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="relative h-48">
            <Image 
              src="https://res.cloudinary.com/dggaqzud0/image/upload/v1749747364/qrgate/events/wnrmwkdfwpxnqix2fgig.jpg" 
              alt="Our Office" 
              fill 
              className="object-cover" 
            />
          </div>
        </Card>
      </div>

      {/* Content Section */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {story}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we're proud to be a leading event management platform, helping thousands of event organizers
              create unforgettable experiences for their audiences.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mission}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {vision}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}