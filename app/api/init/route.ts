import { NextResponse } from "next/server";
import { initializeDatabase } from "@/lib/db";

export async function POST() {
  await initializeDatabase();
  return NextResponse.json({ success: true, message: "Database initialized" });
}
