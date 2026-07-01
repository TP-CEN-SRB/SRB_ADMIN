import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

type AuthPayload = {
  id: string;
  email?: string;
  role?: string;
};

export async function verifyJwt(req: NextRequest): Promise<AuthPayload> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const payload = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    ) as AuthPayload;

    if (!payload.id) {
      throw new Error("Invalid token payload");
    }

    return payload;
  } catch {
    throw new Error("Invalid or expired token");
  }
}
