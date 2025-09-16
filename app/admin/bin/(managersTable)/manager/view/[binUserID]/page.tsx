import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import ViewBinManagerScreen from "@/components/Screen/ViewBinManagerScreen";

const ViewBinManagerPage = async ({ params }: { params: { binUserID: string } }) => {
  const bins = await prisma.bin.findMany({
    where: { userId: params.binUserID },
    include: { binMaterial: true, disposals: true },
  });

  if (!bins.length) {
    notFound();
  }

  // Convert Prisma Date → string (for heartbeat + disposals)
  const binsWithFormattedDates = bins.map((bin) => ({
    ...bin,
    lastHeartBeat: bin.lastHeartBeat ? bin.lastHeartBeat.toISOString() : null,
    disposals: bin.disposals.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    })),
  }));

  const manager = await prisma.user.findUnique({
    where: { id: params.binUserID },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      lat: true,
      long: true,
    },
  });

  if (!manager) {
    notFound();
  }

  return (
    <ViewBinManagerScreen
      binManager={{
        ...manager,
        lat: manager.lat?.toNumber(),
        long: manager.long?.toNumber(),
        bins: binsWithFormattedDates,
      }}
    />
  );
};

export default ViewBinManagerPage;
