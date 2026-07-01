import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";
import { redis } from "@/lib/redis";

export function GET() {
  return Response.json({ ok: true });
}
