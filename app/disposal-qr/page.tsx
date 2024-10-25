import CardBody from "@/components/Card/CardBody";
import CardHeader from "@/components/Card/CardHeader";
import QrCard from "@/components/Card/QrCard";
import QrCodeComponent from "@/components/QrCode/QrImage";
import QrScanListener from "@/components/QrCode/QrScanListener";
import TimerRedirect from "@/components/TimerRedirect";
import { notFound } from "next/navigation";

const QrCodePage = ({
  searchParams,
}: {
  searchParams: { [key: string]: string };
}) => {
  return (
    <div className="flex">
      <QrCard>
        <CardHeader>Scan the QR code!</CardHeader>
        <CardBody>
          <QrCodeComponent id={searchParams.id} />
          <QrScanListener />
        </CardBody>
        <TimerRedirect redirectTo="/" delayInMs={45000} />
      </QrCard>
    </div>
  );
};

export default QrCodePage;
