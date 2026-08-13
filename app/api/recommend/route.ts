import { NextResponse } from "next/server";
import { getRestaurantsWithDeals, getHistory } from "@/lib/db";
import { getRecommendation } from "@/lib/recommend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filters, excludeIds } = body;

    const restaurants = await getRestaurantsWithDeals();
    const history = await getHistory(10);

    const recommendation = await getRecommendation({
      restaurants,
      history,
      filters,
      excludeIds,
    });

    return NextResponse.json(recommendation);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Recommend error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
