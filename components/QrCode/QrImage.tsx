import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getUnscannedDisposal } from "@/app/action/disposal";
import Image from "next/image";

const QrCodeComponent = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const id = searchParams.id;
  if (!id) notFound();
  const disposalData = await getUnscannedDisposal(id);
  if (!disposalData) {
    notFound();
  }
  const data = {
    disposalId: disposalData.id,
  };
  const token = generateQrToken(data);
  const qrCodeUrl = await QRCode.toDataURL(token);

  return <Image className="w-full" src={qrCodeUrl} alt="Generated QR Code" />;
};

export default QrCodeComponent;
