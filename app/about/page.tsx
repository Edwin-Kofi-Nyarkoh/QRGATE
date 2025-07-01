"use client";

import { useAbout } from "@/lib/api/about";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader } from "@/components/ui/card";
import { AboutStats } from "@/components/about/about-stats";
import { AboutHero } from "@/components/about/about-hero";
import { AboutTeam } from "@/components/about/about-team";
import { AboutContact } from "@/components/about/about-contact";

export default function AboutPage() {
  const { data: aboutData, isLoading, error } = useAbout();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading About Information
          </h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <Skeleton className="h-12 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <Skeleton className="h-8 w-8 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-16 mx-auto" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-64 rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">
          About QRGATE
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto font-medium">
          Empowering connections, one event at a time. Discover our story, our
          team, and our mission to make every event unforgettable.
        </p>
      </div>

      {/* Stats Section */}
      <AboutStats
        eventsHosted={aboutData?.eventsHosted}
        happyCustomers={aboutData?.happyCustomers}
        teamSize={aboutData?.teamSize}
        founded={aboutData?.founded}
      />

      {/* Hero Section */}
      <div className="mb-16">
        <AboutHero
          story={aboutData?.story}
          mission={aboutData?.mission}
          vision={aboutData?.vision}
        />
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <AboutTeam
          teamMembers={aboutData?.teamMembers}
          values={aboutData?.values}
        />
      </div>

      {/* Contact Section */}
      <div className="mt-12 max-w-2xl mx-auto">
        <AboutContact
          contact={aboutData?.contact}
          location={aboutData?.location}
        />
      </div>
    </div>
  );
}
