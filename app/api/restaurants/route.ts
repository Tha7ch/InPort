import { validateDrinkProfile, restaurantSaveError } from "@/lib/drink-profile";
import { NextResponse } from "next/server";
import { getRestaurantsWithDeals, createRestaurant } from "@/lib/db";

export async function GET() {
  const restaurants = await getRestaurantsWithDeals();
  return NextResponse.json(restaurants);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Invalid restaurant data." }, { status: 400 });
    const error = validateDrinkProfile(data.drink_profile);
    if (error) return NextResponse.json({ error }, { status: 400 });
    const restaurant = await createRestaurant(data);
    return NextResponse.json(restaurant, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: restaurantSaveError(error) }, { status: 500 });
  }
}
