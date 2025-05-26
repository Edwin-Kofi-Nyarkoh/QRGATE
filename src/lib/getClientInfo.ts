import { headers } from "next/headers";

export async function getClientInfo() {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || "Unknown IP";
    const userAgent = headerList.get("user-agent") || "Unknown Agent";
    return{ip, userAgent};
}