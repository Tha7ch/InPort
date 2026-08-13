import { NextResponse } from "next/server";
import { getRestaurantsWithDeals, getHistory } from "@/lib/db";
import { getRecommendation } from "@/lib/recommend";

export async function POST(request: Request) {
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
}
