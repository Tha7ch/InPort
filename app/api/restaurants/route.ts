import { NextResponse } from "next/server";
import { getAllRestaurants, createRestaurant } from "@/lib/db";

export async function GET() {
  const restaurants = await getAllRestaurants();
  return NextResponse.json(restaurants);
}

export async function POST(request: Request) {
  const data = await request.json();
  const restaurant = await createRestaurant(data);
  return NextResponse.json(restaurant, { status: 201 });
}
