import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getUnscannedDisposal } from "@/app/action/disposal";
import Image from "next/image";
import { getBinUser } from "@/app/action/user";
interface QRCodeComponentProps {
  disposalId: string;
  userId: string;
}
const QrCodeComponent = async ({
  disposalId,
  userId,
}: QRCodeComponentProps) => {
  const disposalData = await getUnscannedDisposal(disposalId);
  if (!disposalData) {
    notFound();
  }
  const binUser = await getBinUser(userId);
  if (!binUser) {
    notFound();
  }
  const data = {
    disposalId: disposalData.id,
    userId: binUser.id,
    material: disposalData.bin.material,
    weightInGrams: disposalData.weightInGrams,
  };
  const token = generateQrToken(data);
  const qrCodeUrl = await QRCode.toDataURL(token);

  return (
    <Image
      width="0"
      height="0"
      className="w-full"
      src={qrCodeUrl}
      alt="Generated QR Code"
    />
  );
};

export default QrCodeComponent;
