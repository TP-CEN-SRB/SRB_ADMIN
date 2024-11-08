import { utapi } from "@/server/uploadthing";
import { RewardSchema } from "@/schemas";
import { getSessionUser } from "@/utils/getAuth";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }
    const values = await req.json();
    console.log(values);
    const validatedFields = RewardSchema.safeParse(values);
    if (!validatedFields.success) {
      return NextResponse.json({ message: "Invalid fields" }, { status: 400 });
    }
    const { name, pointsRequired, image } = validatedFields.data;
    // const res = await utapi.uploadFiles(new File([image], "foo.txt"));
    return NextResponse.json({ message: "No problem" }, { status: 200 });
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
