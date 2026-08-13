import { NextResponse } from "next/server";
import { validatePin, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const { pin } = await request.json();

  if (!pin || typeof pin !== "string") {
    return NextResponse.json({ error: "PIN required" }, { status: 400 });
  }

  const valid = await validatePin(pin);
  if (!valid) {
    return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  }

  await setSessionCookie();
  return NextResponse.json({ success: true });
}
