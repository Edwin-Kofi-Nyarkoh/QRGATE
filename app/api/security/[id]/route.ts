import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if the user is an organizer, admin, or the security officer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const securityOfficer = await prisma.securityOfficer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            organizerId: true,
          },
        },
      },
    });

    if (!securityOfficer) {
      return NextResponse.json(
        { error: "Security officer not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to view this security officer
    const isAdmin = user.role === "ADMIN";
    const isOrganizer =
      user.role === "ORGANIZER" &&
      securityOfficer.event.organizerId === user.id;
    const isSelf = securityOfficer.userId === user.id;

    if (!isAdmin && !isOrganizer && !isSelf) {
      return NextResponse.json(
        { error: "You are not authorized to view this security officer" },
        { status: 403 }
      );
    }

    return NextResponse.json(securityOfficer);
  } catch (error) {
    console.error("Error fetching security officer:", error);
    return NextResponse.json(
      { error: "Failed to fetch security officer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { name, phone, active } = body;

    // Check if the user is an organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the security officer
    const securityOfficer = await prisma.securityOfficer.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!securityOfficer) {
      return NextResponse.json(
        { error: "Security officer not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to update this security officer
    if (
      user.role !== "ADMIN" &&
      securityOfficer.event.organizerId !== user.id
    ) {
      return NextResponse.json(
        { error: "You are not authorized to update this security officer" },
        { status: 403 }
      );
    }

    // Update the security officer
    const updatedOfficer = await prisma.securityOfficer.update({
      where: { id },
      data: {
        name,
        phone,
        active: active !== undefined ? active : securityOfficer.active,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    // Also update the user record if name or phone changed
    if (name || phone) {
      await prisma.user.update({
        where: { id: securityOfficer.userId },
        data: {
          ...(name && { name }),
          ...(phone && { phone }),
        },
      });
    }

    return NextResponse.json(updatedOfficer);
  } catch (error) {
    console.error("Error updating security officer:", error);
    return NextResponse.json(
      { error: "Failed to update security officer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if the user is an organizer or admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || (user.role !== "ADMIN" && user.role !== "ORGANIZER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Find the security officer
    const securityOfficer = await prisma.securityOfficer.findUnique({
      where: { id },
      include: {
        event: true,
      },
    });

    if (!securityOfficer) {
      return NextResponse.json(
        { error: "Security officer not found" },
        { status: 404 }
      );
    }

    // Check if the user is authorized to delete this security officer
    if (
      user.role !== "ADMIN" &&
      securityOfficer.event.organizerId !== user.id
    ) {
      return NextResponse.json(
        { error: "You are not authorized to delete this security officer" },
        { status: 403 }
      );
    }

    // Delete the security officer
    await prisma.securityOfficer.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Security officer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting security officer:", error);
    return NextResponse.json(
      { error: "Failed to delete security officer" },
      { status: 500 }
    );
  }
}
