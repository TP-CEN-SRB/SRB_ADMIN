
// import BinDashboard from "./bin/(allBinsTable)/binDashboard"
import { fetchAll } from "../action/bin"

export default async function admin(){
  // Fetch initial data on the server side using the action we just created
  const { dashboardData, chartsData, UMBinsData } = await fetchAll()

  // Format the stats for the dashboard grid
  const binStatsData = [
    dashboardData.totalFuncBins,
    dashboardData.totalCount,
    dashboardData.totalDisposalCount,
    dashboardData.totalUMBins,
  ]

  return (
    <div className="w-full">
      {/* <BinDashboard 
        DBBarChartData={chartsData.DBBarChartData} 
        DBPieChartData={chartsData.DBPieChartData} 
        DBLineChartData={chartsData.binDisposalsTimeLine as any} 
        initialStatsData={binStatsData} 
        UMBinsData={UMBinsData as any}
        // Notice we are NO LONGER passing fetchAll as a prop here!
      /> */}
      Admin Dashboard
    </div>
  )
}