import { auth } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();
  const user = session?.user;
  console.log(user);
  console.log("hello");
  return <div></div>;
}
