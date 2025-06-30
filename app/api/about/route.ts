import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const aboutData = await prisma.about.findFirst({
      include: {
        teamMembers: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!aboutData) {
      const now = new Date();

      const placeholder = {
        id: "about-placeholder-id",
        mission: "Our mission is to connect the world through events.",
        vision: "We envision a globally connected creative community.",
        story: "Founded in 2020 to empower creators through technology.",
        founded: 2020,
        location: "Assin Foso, Ghana",
        teamSize: 3,
        eventsHosted: 120,
        happyCustomers: 3500,
        values: [
          "Innovation",
          "Creativity",
          "Community",
          "Excellence",
          "Integrity",
          "Accessibility",
          "Growth",
        ],
        contactEmail: "contact@placeholder.com",
        contactPhone: "+233 59 834 6928",
        contactWebsite: "https://placeholder.com",
        createdAt: now,
        updatedAt: now,
        teamMembers: [
          {
            id: "member-1",
            name: "Masood Acheampong",
            role: "CEO & CTO",
            image:
              "https://res.cloudinary.com/dggaqzud0/image/upload/v1749889611/qrgate/events/ctlzalwgbcz1aodfxxir.jpg",
            bio: "Masood is the visionary behind the company.",
            order: 1,
            aboutId: "about-placeholder-id",
          },
          {
            id: "member-2",
            name: "Edwin Kofi Nyarkoh",
            role: "CTO",
            image:
              "https://res.cloudinary.com/dggaqzud0/image/upload/v1749889611/qrgate/events/ctlzalwgbcz1aodfxxir.jpg",
            bio: "Edwin leads the tech team with passion.",
            order: 2,
            aboutId: "about-placeholder-id",
          },
          {
            id: "member-3",
            name: "Kojo Antwi",
            role: "Design Lead",
            image:
              "https://res.cloudinary.com/dggaqzud0/image/upload/v1749889611/qrgate/events/ctlzalwgbcz1aodfxxir.jpg",
            bio: "Kojo brings ideas to life visually.",
            order: 3,
            aboutId: "about-placeholder-id",
          },
        ],
      };

      return NextResponse.json(placeholder, {
        status: 200,
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    const response = {
      id: aboutData.id,
      mission: aboutData.mission,
      vision: aboutData.vision,
      story: aboutData.story,
      founded: aboutData.founded,
      location: aboutData.location,
      teamSize: aboutData.teamSize,
      eventsHosted: aboutData.eventsHosted,
      happyCustomers: aboutData.happyCustomers,
      values: aboutData.values ? JSON.parse(aboutData.values) : [],
      contactEmail: aboutData.contactEmail,
      contactPhone: aboutData.contactPhone,
      contactWebsite: aboutData.contactWebsite,
      createdAt: aboutData.createdAt,
      updatedAt: aboutData.updatedAt,
      teamMembers: aboutData.teamMembers.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        image: member.image,
        bio: member.bio,
        order: member.order,
        aboutId: member.aboutId,
      })),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching about data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
