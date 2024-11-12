import jwt from "jsonwebtoken";
export const generateQrToken = (data: {
  disposalId: string;
  userId: string;
  material: string;
  weightInGrams: number;
}) => {
  const token = jwt.sign(data, process.env.NEXT_JWT_SECRET_KEY!, {
    expiresIn: "2m",
  });
  return token;
};
