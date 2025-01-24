import React from "react";
import UsersLeaderboard from "./userLeaderboard";
import { getTopHundredUsers } from "@/app/action/user";

const UsersDashboardPage = async () => {
  const leaderboardData = await getTopHundredUsers();
  return <UsersLeaderboard leaderBoardData={leaderboardData} />;
};

export default UsersDashboardPage;
