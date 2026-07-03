import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeftCircle, Clock4 } from "lucide-react";
import Link from "next/link";

const RecordingDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 

  const video = await prisma.video.findUnique({
    where: { id },
  });

  if (!video) return notFound();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/recordings"
        className="inline-flex items-center text-sm text-blue-600 hover:underline"
      >
        <ArrowLeftCircle className="w-4 h-4 mr-1" />
        Back to Recordings
      </Link>

      <h1 className="text-2xl font-bold">{video.name}</h1>

      <p className="text-muted-foreground flex items-center gap-1">
        <Clock4 className="w-4 h-4" />
        Duration: {video.durationInSeconds}s
      </p>

      <div className="rounded-lg overflow-hidden border shadow">
        <video
          controls
          className="w-full max-h-[600px] bg-black"
          src={video.fileUrl}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default RecordingDetailPage;
