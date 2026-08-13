import { NextResponse } from "next/server";
import { getDealsByRestaurant, createDeal } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deals = await getDealsByRestaurant(id);
  return NextResponse.json(deals);
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await request.json();
  const deal = await createDeal({ ...data, restaurant_id: id });
  return NextResponse.json(deal, { status: 201 });
}
