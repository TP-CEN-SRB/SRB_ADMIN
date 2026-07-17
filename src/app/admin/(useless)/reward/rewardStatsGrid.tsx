
import { IoMdTrendingDown } from "react-icons/io"
import { LuTrophy } from "react-icons/lu"
import { MdCardGiftcard } from "react-icons/md"
import { FaFire } from "react-icons/fa"
import { prisma } from "@/lib/db"

const RewardStatsGrid = async () => {
  const [
    totalRewards,
    totalRedemptions,
    mostPopularReward,
    mostExpensiveReward,
  ] = await Promise.all([
    prisma.reward.count(),
    prisma.redemption.count(),
    prisma.redemption.groupBy({
      by: ["rewardId"],
      _count: {
        rewardId: true,
      },
      orderBy: {
        _count: {
          rewardId: "desc",
        },
      },
      take: 1,
    }),
    prisma.reward.findFirst({
      orderBy: { pointsRequired: "desc" },
      select: { pointsRequired: true, name: true },
    }),
  ])
  let reward
  if (mostPopularReward.length) {
    reward = await prisma.reward.findUnique({
      where: { id: mostPopularReward[0].rewardId },
      select: { name: true },
    })
  }

  const rewardStatsData = [
    {
      color: "#34b7eb",
      icon: <LuTrophy className="text-xl sm:text-2xl text-[#34b7eb] mr-2" />,
      title: "Total rewards",
      value: totalRewards,
      description: "Rewards",
    },
    {
      color: "#22e38f",
      icon: (
        <MdCardGiftcard className="text-xl sm:text-2xl text-[#22e38f] mr-2" />
      ),
      title: "Total redemptions",
      value: totalRedemptions,
      description: "Redemptions",
    },
    {
      color: "#ef4444",
      icon: <FaFire className="text-xl sm:text-2xl text-red-500 mr-2" />,
      title: "Most popular reward",
      value:
        mostPopularReward[0]?._count.rewardId === 0
          ? 0
          : mostPopularReward[0]?._count.rewardId,
      description: (
        <>
          Redemptions
          <span className="font-bold text-lg line-clamp-1">
            {reward?.name || "Not available"}
          </span>
        </>
      ),
    },
    {
      color: "gray",
      icon: <IoMdTrendingDown />,
      title: "Most expensive reward",
      value: mostExpensiveReward?.pointsRequired,
      description: (
        <>
          Points
          <span className="font-bold line-clamp-1">
            {mostExpensiveReward?.name || "Not available"}
          </span>
        </>
      ),
    },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {rewardStatsData.map((data, index) => {
        return (
          <div
            key={index}
            className="relative bg-white p-4 flex flex-col gap-2 rounded-lg overflow-hidden"
          >
            <div
              className={`absolute inset-y-0 left-0 w-2.5 rounded-l-lg`}
              style={{ backgroundColor: data.color }}
            />
            <div className="pl-4 text-slate-700">
              <div className="flex items-center gap-2">
                <span className="" style={{ color: data.color }}>
                  {data.icon}
                </span>
                <span className="text-lg sm:text-xl font-bold">
                  {data.title}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-3xl sm:text-4xl">
                  {data.value}
                </span>
                <span className="font-light text-sm sm:text-base">
                  {data.description}
                </span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default RewardStatsGrid
