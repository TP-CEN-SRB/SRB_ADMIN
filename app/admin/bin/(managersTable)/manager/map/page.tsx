import { getAllBinUsers } from "@/app/action/user";
import MapChart from "@/components/Map/BinMapChart";

const BinManagerMap = async () => {
  const binManagers = await getAllBinUsers();
  return (
    <MapChart
      data={binManagers.map((user) => ({
        ...user,
        lat: user.lat?.toNumber(),
        long: user.long?.toNumber(),
      }))}
    />
  );
};

export default BinManagerMap;
