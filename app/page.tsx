import HomeScreen from "@/components/HomeScreen";
import { getSessionUser } from "@/utils/getAuth";

export default async function Home() {
  const user = await getSessionUser();
  return <HomeScreen role={user?.role} userId={user?.id} />;
}
