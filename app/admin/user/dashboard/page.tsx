import React from "react";
import UsersLeaderboard from "./userLeaderboard";
import { getTopTenUsers } from "@/app/action/user";

const UsersDashboardPage = async () => {
  const leaderboardData = await getTopTenUsers();
  return <UsersLeaderboard leaderBoardData={leaderboardData} />;
};

export default UsersDashboardPage;
