import { validateDrinkProfile, restaurantSaveError } from "@/lib/drink-profile";
import { NextResponse } from "next/server";
import { getRestaurantById, updateRestaurant, deleteRestaurant } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);
  if (!restaurant) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(restaurant);
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await request.json();
    if (!data || typeof data !== "object" || Array.isArray(data)) return NextResponse.json({ error: "Invalid restaurant data." }, { status: 400 });
    const error = validateDrinkProfile(data.drink_profile);
    if (error) return NextResponse.json({ error }, { status: 400 });
    const restaurant = await updateRestaurant(id, data);
    if (!restaurant) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(restaurant);
  } catch (error) {
    return NextResponse.json({ error: restaurantSaveError(error) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteRestaurant(id);
  return NextResponse.json({ success: true });
}
