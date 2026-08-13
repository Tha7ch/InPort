import { NextResponse } from "next/server";
import { deleteDeal } from "@/lib/db";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteDeal(id);
  return NextResponse.json({ success: true });
}
