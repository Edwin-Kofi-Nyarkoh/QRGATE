import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const adminData = {
  name: "Super Admin",
  email: "admin@eventbooking.com",
  password: "admin123",
  phone: "+233200000000",
  address: "1 Admin Street, Accra, Ghana",
};

export async function POST(request: NextRequest) {
  try {
    // Security: Require secret_token in env and in request
    const envSecret = process.env.SECRET_TOKEN;
    const url = new URL(request.url);
    const tokenFromQuery = url.searchParams.get("secret_token");
    const tokenFromHeader = request.headers.get("x-secret-token");
    const providedToken = tokenFromQuery || tokenFromHeader;

    if (!envSecret || !providedToken || providedToken !== envSecret) {
      return NextResponse.json(
        { error: "Unauthorized. Valid secret_token required." },
        { status: 403 }
      );
    }

    // const session = await getServerSession(authOptions);

    // if (
    //   !session ||
    //   (session.user && (session.user as { role?: string }).role !== "ADMIN")
    // ) {
    //   return NextResponse.json(
    //     { error: "Unauthorized. Admin access required." },
    //     { status: 403 }
    //   );
    // }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Create admin
    const admin = await prisma.user.create({
      data: {
        name: adminData.name,
        email: adminData.email,
        password: hashedPassword,
        phone: adminData.phone,
        address: adminData.address,
        role: "ADMIN",
        isOrganizer: false,
        emailVerified: new Date(), // Auto-verify for seeded account
      },
    });

    return NextResponse.json({
      message: "Admin seeded successfully.",
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Error seeding admin:", error);
    return NextResponse.json(
      { error: "Failed to seed admin" },
      { status: 500 }
    );
  }
}
