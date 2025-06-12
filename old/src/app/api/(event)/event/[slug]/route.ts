import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req:NextRequest,
    context: {params: Promise<{slug: string}>}
) {
    try{
        const {slug} = await context.params;
        const decodedSlug = decodeURIComponent(slug);

        const events = await prisma.event.findUnique({
            where:{
                slug: decodedSlug
            }
        })

        if (!events) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
          }

          return NextResponse.json(events)
    }catch(error){
        console.log("Error fetching product:",error);
        return NextResponse.json(
            { error: "Failed to fetch product" },
            { status: 500 }
          );
    }
    
}