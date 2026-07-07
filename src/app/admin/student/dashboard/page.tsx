
import UsersLeaderboard from "./userLeaderboard"
import { getTopTenUsers } from "@/app/action/user"
import { DateRange } from "@/utils/dateUtils"

type FilterPeriod = "week" | "month" | "year"

const UsersDashboardPage = async () => {
  const getDateRange = (period: FilterPeriod) => DateRange(period)
  const {startDate, endDate} = getDateRange("week")
  const leaderboardData = await getTopTenUsers(startDate, endDate)
  return <UsersLeaderboard leaderBoardData={leaderboardData} />
}

export default UsersDashboardPage
