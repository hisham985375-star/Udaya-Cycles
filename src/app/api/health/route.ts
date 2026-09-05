import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

  const healthy = dbState === 1 || dbState === 2;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      database: dbStatus,
      uptime: process.uptime(),
    },
    { status: healthy ? 200 : 503 }
  );
}
