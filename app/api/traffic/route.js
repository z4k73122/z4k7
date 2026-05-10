// app/api/traffic/stats/route.js
import { NextResponse } from "next/server";
import { getTrafficStats } from "@/app/api/traffic/firebase-stats";

export async function GET(request) {
  try {
    const stats = await getTrafficStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
