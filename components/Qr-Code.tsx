import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { generateQrToken } from "@/lib/jwt-tokens";
import { getDisposal } from "@/app/action/disposal";

const QrCodeComponent = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const id = searchParams.id;

  if (!id) notFound();

  const disposalData = await getDisposal(id);
  if (!disposalData) {
    notFound();
  }

  const data = {
    material: disposalData.bin.material,
    weightInGrams: disposalData.weightInGrams,
  };

  const token = generateQrToken(data);
  const qrCodeUrl = await QRCode.toDataURL(token);

  return <img className="w-full" src={qrCodeUrl} alt="Generated QR Code" />;
};

export default QrCodeComponent;
