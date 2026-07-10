
import UsersLeaderboard from "./userLeaderboard"
import { getTopTenUsers } from "@/app/action/user"
import { DateRange } from "@/utils/dateUtils"

type FilterPeriod = "week" | "month" | "year"

export default async function UsersDashboardPage(){
  const getDateRange = (period: FilterPeriod) => DateRange(period)
  const {startDate, endDate} = getDateRange("week")
  const leaderboardData = await getTopTenUsers(startDate, endDate)

  return(
    <div className="h-full w-full overflow-y-auto pb-8">
        <UsersLeaderboard leaderBoardData={leaderboardData} />
    </div>
  )
}

