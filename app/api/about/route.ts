import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch from database
    const aboutData = await prisma.about.findFirst({
      include: {
        teamMembers: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    })

    if (!aboutData) {
      return NextResponse.json(
        { error: 'About data not found' },
        { status: 404 }
      )
    }

    // Transform data to match your interface
    const response = {
      mission: aboutData.mission,
      vision: aboutData.vision,
      story: aboutData.story,
      founded: aboutData.founded,
      location: aboutData.location,
      teamSize: aboutData.teamSize,
      eventsHosted: aboutData.eventsHosted,
      happyCustomers: aboutData.happyCustomers,
      teamMembers: aboutData.teamMembers.map(member => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image: member.image,
        bio: member.bio
      })),
      values: aboutData.values ? JSON.parse(aboutData.values) : [],
      contact: {
        email: aboutData.contactEmail,
        phone: aboutData.contactPhone,
        website: aboutData.contactWebsite
      }
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error fetching about data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}