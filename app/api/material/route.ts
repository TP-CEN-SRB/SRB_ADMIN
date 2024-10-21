import { NextRequest, NextResponse } from "next/server";
let storedMaterial: string | undefined; // Variable to store the material
let storedWeightInGrams: number | undefined;
export const GET = async (req: NextRequest) => {
  try {
    if (storedMaterial === "" || storedMaterial === undefined) {
      return NextResponse.json(
        { message: "No material detected" },
        { status: 404 }
      );
    }
    if (storedWeightInGrams == 0 || storedWeightInGrams === undefined) {
      return NextResponse.json(
        { message: "Missing weight of material" },
        { status: 404 }
      );
    }
    const material = storedMaterial;
    const weightInGrams = storedWeightInGrams;
    storedMaterial = "";
    storedWeightInGrams = 0;
    return NextResponse.json({ material, weightInGrams }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { material, weightInGrams } = await req.json();
    if (!material) {
      return NextResponse.json(
        { message: "No material detected" },
        { status: 404 }
      );
    }
    if (!weightInGrams) {
      return NextResponse.json(
        { message: "Missing weight of material" },
        { status: 404 }
      );
    }
    storedMaterial = material;
    storedWeightInGrams = weightInGrams;
    return NextResponse.json(
      { message: "Material details received" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
