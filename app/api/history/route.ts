import { NextResponse } from "next/server";
import { getHistory, createHistoryEntry } from "@/lib/db";

export async function GET() {
  const history = await getHistory(50);
  return NextResponse.json(history);
}

export async function POST(request: Request) {
  const data = await request.json();
  const entry = await createHistoryEntry(data);
  return NextResponse.json(entry, { status: 201 });
}
