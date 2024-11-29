import React from "react";
import UsersDashboard from "./userDashboard";
import { getTopTenUsers } from "@/app/action/user";

const UsersDashboardPage = async () => {
  const leaderboardData = await getTopTenUsers();
  return <UsersDashboard leaderBoardData={leaderboardData} />;
};

export default UsersDashboardPage;
