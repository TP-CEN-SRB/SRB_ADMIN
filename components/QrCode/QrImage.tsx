import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getUnscannedDisposal } from "@/app/action/disposal";
import Image from "next/image";

const QrCodeComponent = async ({ disposalId }: { disposalId: string }) => {
  const disposalData = await getUnscannedDisposal(disposalId);
  if (!disposalData) {
    notFound();
  }
  const data = {
    disposalId: disposalData.id,
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
