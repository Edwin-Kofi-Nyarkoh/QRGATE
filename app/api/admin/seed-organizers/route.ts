import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const organizersData = [
  {
    name: "Accra Event Masters",
    email: "info@accraeventmasters.com",
    password: "organizer123",
    phone: "+233201234567",
    address: "15 Independence Avenue, Accra, Ghana",
  },
  {
    name: "Kumasi Gatherings",
    email: "contact@kumasigatherings.com",
    password: "organizer123",
    phone: "+233209876543",
    address: "22 Adum Road, Kumasi, Ghana",
  },
  {
    name: "Cape Coast Celebrations",
    email: "hello@capecoastcelebrations.com",
    password: "organizer123",
    phone: "+233208765432",
    address: "10 Castle Street, Cape Coast, Ghana",
  },
];

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // if (
    //   !session ||
    //   (session.user && (session.user as { role?: string }).role !== "ADMIN")
    // ) {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin access required." },
    //     { status: 403 }
    //   );
    // }

    const createdOrganizers = [];

    for (const organizerData of organizersData) {
      // Check if organizer already exists
      const existingOrganizer = await prisma.user.findUnique({
        where: { email: organizerData.email },
      });

      if (existingOrganizer) {
        console.log(`Organizer ${organizerData.email} already exists`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(organizerData.password, 12);

      // Create organizer
      const organizer = await prisma.user.create({
        data: {
          name: organizerData.name,
          email: organizerData.email,
          password: hashedPassword,
          phone: organizerData.phone,
          address: organizerData.address,
          role: "ORGANIZER",
          isOrganizer: true,
          emailVerified: new Date(), // Auto-verify for seeded accounts
        },
      });

      createdOrganizers.push({
        id: organizer.id,
        name: organizer.name,
        email: organizer.email,
      });
    }

    return NextResponse.json({
      message: `Successfully created ${createdOrganizers.length} organizers`,
      organizers: createdOrganizers,
    });
  } catch (error) {
    console.error("Error seeding organizers:", error);
    return NextResponse.json(
      { error: "Failed to seed organizers" },
      { status: 500 }
    );
  }
}
