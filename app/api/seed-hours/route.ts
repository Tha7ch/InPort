import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const HOURS: Record<string, Record<string, { open: string; close: string } | null>> = {
  "Brine": {
    monday: { open: "11:30", close: "21:00" },
    tuesday: { open: "11:30", close: "21:00" },
    wednesday: { open: "11:30", close: "21:00" },
    thursday: { open: "11:30", close: "21:00" },
    friday: { open: "11:30", close: "22:00" },
    saturday: { open: "11:30", close: "22:00" },
    sunday: { open: "11:30", close: "21:00" },
  },
  "Ceia Kitchen + Bar": {
    monday: null,
    tuesday: { open: "17:00", close: "21:00" },
    wednesday: { open: "17:00", close: "21:00" },
    thursday: { open: "17:00", close: "21:00" },
    friday: { open: "17:00", close: "22:00" },
    saturday: { open: "17:00", close: "22:00" },
    sunday: { open: "17:00", close: "21:00" },
  },
  "Mission Oak Grill": {
    monday: null,
    tuesday: { open: "16:00", close: "21:00" },
    wednesday: { open: "16:00", close: "21:00" },
    thursday: { open: "16:00", close: "21:00" },
    friday: { open: "16:00", close: "22:00" },
    saturday: { open: "11:30", close: "22:00" },
    sunday: { open: "11:30", close: "21:00" },
  },
  "Oregano": {
    monday: { open: "11:00", close: "21:00" },
    tuesday: { open: "11:00", close: "21:00" },
    wednesday: { open: "11:00", close: "21:00" },
    thursday: { open: "11:00", close: "21:00" },
    friday: { open: "11:00", close: "22:00" },
    saturday: { open: "11:00", close: "22:00" },
    sunday: { open: "11:00", close: "21:00" },
  },
  "Loretta": {
    monday: null,
    tuesday: { open: "17:00", close: "22:00" },
    wednesday: { open: "17:00", close: "22:00" },
    thursday: { open: "17:00", close: "22:00" },
    friday: { open: "17:00", close: "23:00" },
    saturday: { open: "17:00", close: "23:00" },
    sunday: { open: "17:00", close: "21:00" },
  },
  "The Poynt": {
    monday: { open: "11:30", close: "22:00" },
    tuesday: { open: "11:30", close: "22:00" },
    wednesday: { open: "11:30", close: "22:00" },
    thursday: { open: "11:30", close: "22:00" },
    friday: { open: "11:30", close: "23:00" },
    saturday: { open: "11:30", close: "23:00" },
    sunday: { open: "11:30", close: "22:00" },
  },
  "Szechuan Garden": {
    monday: { open: "11:00", close: "21:30" },
    tuesday: { open: "11:00", close: "21:30" },
    wednesday: { open: "11:00", close: "21:30" },
    thursday: { open: "11:00", close: "21:30" },
    friday: { open: "11:00", close: "22:00" },
    saturday: { open: "11:00", close: "22:00" },
    sunday: { open: "12:00", close: "21:30" },
  },
  "Bob Lobster": {
    monday: { open: "11:00", close: "20:00" },
    tuesday: { open: "11:00", close: "20:00" },
    wednesday: { open: "11:00", close: "20:00" },
    thursday: { open: "11:00", close: "20:00" },
    friday: { open: "11:00", close: "21:00" },
    saturday: { open: "11:00", close: "21:00" },
    sunday: { open: "11:00", close: "20:00" },
  },
  "Park Lunch": {
    monday: { open: "06:00", close: "14:00" },
    tuesday: { open: "06:00", close: "14:00" },
    wednesday: { open: "06:00", close: "14:00" },
    thursday: { open: "06:00", close: "14:00" },
    friday: { open: "06:00", close: "14:00" },
    saturday: { open: "06:00", close: "14:00" },
    sunday: { open: "06:00", close: "14:00" },
  },
  "Angie's Food and Diner": {
    monday: { open: "06:00", close: "14:00" },
    tuesday: { open: "06:00", close: "14:00" },
    wednesday: { open: "06:00", close: "14:00" },
    thursday: { open: "06:00", close: "14:00" },
    friday: { open: "06:00", close: "14:00" },
    saturday: { open: "06:00", close: "14:00" },
    sunday: { open: "06:00", close: "14:00" },
  },
  "Morning Buzz Cafe": {
    monday: { open: "06:30", close: "15:00" },
    tuesday: { open: "06:30", close: "15:00" },
    wednesday: { open: "06:30", close: "15:00" },
    thursday: { open: "06:30", close: "15:00" },
    friday: { open: "06:30", close: "15:00" },
    saturday: { open: "07:00", close: "15:00" },
    sunday: { open: "07:00", close: "15:00" },
  },
  "Lexie's Joint": {
    monday: { open: "08:00", close: "14:00" },
    tuesday: { open: "08:00", close: "14:00" },
    wednesday: { open: "08:00", close: "14:00" },
    thursday: { open: "08:00", close: "14:00" },
    friday: { open: "08:00", close: "14:00" },
    saturday: { open: "08:00", close: "14:00" },
    sunday: { open: "08:00", close: "14:00" },
  },
  "Sea Level": {
    monday: null,
    tuesday: { open: "16:00", close: "21:00" },
    wednesday: { open: "16:00", close: "21:00" },
    thursday: { open: "16:00", close: "21:00" },
    friday: { open: "16:00", close: "22:00" },
    saturday: { open: "12:00", close: "22:00" },
    sunday: { open: "12:00", close: "21:00" },
  },
  "Metzys": {
    monday: { open: "11:00", close: "21:00" },
    tuesday: { open: "11:00", close: "21:00" },
    wednesday: { open: "11:00", close: "21:00" },
    thursday: { open: "11:00", close: "21:00" },
    friday: { open: "11:00", close: "22:00" },
    saturday: { open: "11:00", close: "22:00" },
    sunday: { open: "11:00", close: "21:00" },
  },
  "Sunset Club": {
    monday: { open: "11:30", close: "21:00" },
    tuesday: { open: "11:30", close: "21:00" },
    wednesday: { open: "11:30", close: "21:00" },
    thursday: { open: "11:30", close: "21:00" },
    friday: { open: "11:30", close: "22:00" },
    saturday: { open: "11:30", close: "22:00" },
    sunday: { open: "11:30", close: "21:00" },
  },
  "Abrahamas Bagels": {
    monday: { open: "06:00", close: "14:00" },
    tuesday: { open: "06:00", close: "14:00" },
    wednesday: { open: "06:00", close: "14:00" },
    thursday: { open: "06:00", close: "14:00" },
    friday: { open: "06:00", close: "14:00" },
    saturday: { open: "06:00", close: "14:00" },
    sunday: { open: "06:00", close: "14:00" },
  },
  "Dunkin Donuts": {
    monday: { open: "05:00", close: "21:00" },
    tuesday: { open: "05:00", close: "21:00" },
    wednesday: { open: "05:00", close: "21:00" },
    thursday: { open: "05:00", close: "21:00" },
    friday: { open: "05:00", close: "21:00" },
    saturday: { open: "05:00", close: "21:00" },
    sunday: { open: "05:00", close: "21:00" },
  },
};

export async function POST() {
  const sql = neon(process.env.DATABASE_URL!);

  await sql`ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS operating_hours JSONB`;

  let updated = 0;
  for (const [name, hours] of Object.entries(HOURS)) {
    const result = await sql`UPDATE restaurants SET operating_hours = ${JSON.stringify(hours)}, updated_at = NOW() WHERE name = ${name}`;
    if (result.length > 0) updated++;
  }

  return NextResponse.json({ success: true, updated, total: Object.keys(HOURS).length });
}
