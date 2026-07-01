import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Faculty } from "@prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      );
    }
    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    // Fetch bins with the necessary details
    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        status: true,
        currentCapacity: true,
        binMaterial: { select: { name: true } },
        user: {
          select: {
            location: true,
            id: true,
            faculty: true,
            lat: true,
            long: true,
          },
        },
      },
    });

    if (!bins || bins.length === 0) {
      return NextResponse.json({ message: "No bins found!" }, { status: 404 });
    }

    //Transform data to provide a more meaningful API response
    const transformedBins = bins.map((bin) => ({
      binId: bin.id,
      faculty: bin.user.faculty,
      material: bin.binMaterial.name,
      currentCapacity: bin.currentCapacity,
      status: bin.status,
      location: bin.user.location,
      userId: bin.user.id,
      lat: bin.user.lat?.toNumber(),
      long: bin.user.long?.toNumber(),
    }));
    type GroupedBins = {
      [location: string]: {
        location: string;
        faculty: Faculty;
        lat: number | undefined;
        long: number | undefined;
        bins: {
          binId: string;
          material: string;
          currentCapacity: number;
          status: string;
        }[];
      };
    };

    const groupedBins = transformedBins.reduce<GroupedBins>((acc, bin) => {
      // Ensure location exists and use "Unknown Location" if it's missing
      const locationKey = bin.location || "Unknown Location";

      // Initialize the group if it doesn't exist
      if (!acc[locationKey]) {
        acc[locationKey] = {
          location: locationKey,
          faculty: bin.faculty,
          lat: bin.lat,
          long: bin.long,
          bins: [],
        };
      }

      // Add the current bin to the corresponding location group
      acc[locationKey].bins.push({
        binId: bin.binId,
        material: bin.material,
        currentCapacity: bin.currentCapacity,
        status: bin.status.replace("_", " "),
      });

      return acc;
    }, {});

    // Convert groupedBins object into an array format
    const responseData = Object.values(groupedBins);

    return NextResponse.json({ data: responseData }, { status: 200 });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: "Token has expired!" },
        { status: 401 }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Token is invalid!" },
        { status: 401 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
