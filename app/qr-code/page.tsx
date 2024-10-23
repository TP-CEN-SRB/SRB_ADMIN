import QRCode from "qrcode";
import { notFound } from "next/navigation";
import { getDisposal } from "../action/disposal";
import { generateQrToken } from "@/lib/jwt-tokens";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import jwt from "jsonwebtoken";

const QrCodePage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  const id = searchParams.id;
  const generateQR = async () => {
    const disposalData = await getDisposal(id);
    if (!disposalData) {
      notFound();
    }
    const data = {
      material: disposalData?.bin.material,
      weightInGrams: disposalData?.weightInGrams,
    };
    const token = generateQrToken(data);
    const url = await QRCode.toDataURL(token);
    return url;
  };
  const qrCodeUrl = await generateQR();

  return (
    <div>
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan the QR code!</DialogTitle>
            <DialogDescription>
              <img className="w-full" src={qrCodeUrl} alt="Generated QR Code" />
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QrCodePage;
