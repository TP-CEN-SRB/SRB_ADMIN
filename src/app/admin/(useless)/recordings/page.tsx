
import { prisma } from "@/lib/db"
import VideoDataTable from "./videoDataTable"

const getData = async function(){
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" },
  })

  return videos.map((video) => ({
    id: video.id,
    name: video.name,
    url: video.fileUrl,
    duration: video.durationInSeconds,
     createdAt: video.createdAt.toISOString(),
  }))
}

const RecordingsPage = async function(){
  const data = await getData()
  return <VideoDataTable data={data} />
}

export default RecordingsPage
