import CardBody from "@/components/Card/CardBody";
import CardHeader from "@/components/Card/CardHeader";
import QrCard from "@/components/Card/QrCard";
import QrCodeComponent from "@/components/Qr-Code";
import TimerRedirect from "@/components/TimerRedirect";

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
          <QrCodeComponent searchParams={searchParams} />
        </CardBody>
        {/* <TimerRedirect redirectTo="/" delayInMs={30000} /> */}
      </QrCard>
    </div>
  );
};

export default QrCodePage;
