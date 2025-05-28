import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import slugify from "slugify";
import cloudinary from "@/lib/cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden, this is route is for only Authorised USERS 😟🧑‍💻" },
      { status: 403 }
    );
  }

  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const trending = formData.get("trending") as string;
    const stock = parseInt(formData.get("stock") as string);
    const category = formData.get("category") as string | null;
    const organiserEmail = formData.get("organiserEmail") as string;
    const organiserContact = formData.get("organiserContact") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const file = formData.get("image") as File;

    if (!name || !description || !price || !stock || !file || !organiserEmail || !organiserContact || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined
        ) => {
          if (error || !result) return reject(error || new Error("Upload failed"));
          resolve(result);
        }
      ).end(buffer);
    });

    const isTrending = trending === "true";

    const baseSlug = slugify(name, { lower: true });
    let slug = baseSlug;
    let count = 1;

    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const product = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        price,
        trending: isTrending,
        stock,
        startDate,
        endDate,
        category,
        image: result.secure_url,
        organiserEmail,
        organiserContact,
      },
    });

    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
