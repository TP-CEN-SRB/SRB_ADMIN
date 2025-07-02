import { getHeartbeat } from "@/app/action/bin";

export default async function SmartBinDashboard() {
  const bins = await getHeartbeat();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Smart Bin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {bins.map((bin) => (
          <div
            key={bin.id}
            className="p-4 rounded-2xl shadow border border-gray-200 bg-white flex flex-col items-center"
          >
            <div className="text-3xl font-semibold">{bin.currentCapacity}%</div>
            <div className="text-lg mt-2">{bin.material}</div>
            <div
              className={`text-sm mt-1 ${
                bin.isOnline ? "text-green-500" : "text-red-500"
              }`}
            >
              {bin.isOnline ? "online" : "offline"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
