import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getUnscannedDisposal } from "@/app/action/disposal";

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

  return <img className="w-full" src={qrCodeUrl} alt="Generated QR Code" />;
};

export default QrCodeComponent;
