"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  bio: string
}

interface AboutTeamProps {
  teamMembers?: TeamMember[]
  values?: string[]
}

export function AboutTeam({ 
  teamMembers = [],
  values = ["Innovation", "Community", "Excellence", "Integrity", "Accessibility", "Growth"]
}: AboutTeamProps) {
  return (
    <div className="space-y-12">
      {/* Values Section */}
      <Card className="mb-12">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center mb-6">Our Values</h2>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {values.map((value, index) => (
              <div key={index} className="text-center">
                <Badge variant="secondary" className="text-sm px-4 py-2 w-full justify-center">
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Section */}
      {teamMembers && teamMembers.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-center mb-6">Meet Our Team</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <Image
                        src={member.image || "/placeholder.svg?height=96&width=96"}
                        alt={member.name}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <Badge variant="outline" className="mb-2">
                      {member.role}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}