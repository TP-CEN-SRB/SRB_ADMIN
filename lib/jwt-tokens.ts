import jwt from "jsonwebtoken";
export const generateQrToken = (data: {
  weightInGrams: number;
  material: string;
}) => {
  const token = jwt.sign(data, process.env.NEXT_JWT_SECRET_KEY!, {
    expiresIn: "1h",
  });
  return token;
};
