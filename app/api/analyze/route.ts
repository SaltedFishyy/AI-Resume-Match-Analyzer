import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ message: "Analysis API will be implemented in the next phase." }, { status: 501 });
}
