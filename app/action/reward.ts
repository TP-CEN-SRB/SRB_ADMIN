"use server";
// import { z } from "zod";
// import { RewardSchema } from "@/schemas";
// import { utapi } from "@/server/uploadthing";
// const createReward = async (values: z.infer<typeof RewardSchema>) => {
//   console.log(values);
//   const validatedFields = RewardSchema.safeParse(values);
//   if (!validatedFields.success) {
//     return { error: "Invalid fields" };
//   }

//   const { name, pointsRequired, image } = validatedFields.data;
//   const res = await utapi.uploadFiles(new File([image], "foo.txt"));
// };

// export { createReward };

import { RewardSchema } from "@/schemas";
import { utapi } from "@/server/uploadthing";
import { z } from "zod";

export async function createReward(formData: FormData) {
  const validatedFields = RewardSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!validatedFields.success) {
    return { error: "Invalid fields" };
  }

  const { name, pointsRequired, image } = validatedFields.data;
  const res = await utapi.uploadFiles(new File([image], "foo.txt"));
  return {
    success: "Reward parsed successfully!",
  };
}
