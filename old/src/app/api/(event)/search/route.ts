import { NextResponse, NextRequest } from "next/server";
import {prisma} from "@/lib/prisma";
 export async function GET(req: NextRequest) {
    const {searchParams} = new URL (req.url);
    const query = searchParams.get('query') || '';

    if(!query){
        return NextResponse.json([]);
    }
    
    const results = await prisma.event.findMany({
        where:{
            name:{
                contains: query,
                mode:'insensitive',
            },
        },
        select:{
            id: true,
            name: true,
            slug: true
        },
        take: 5
    })

    return NextResponse.json(results);
 }