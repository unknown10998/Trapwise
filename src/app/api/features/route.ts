import { NextResponse } from "next/server";
import { getFeatureAvailability } from "@/lib/featureAvailability";
export function GET() { return NextResponse.json(getFeatureAvailability()); }
