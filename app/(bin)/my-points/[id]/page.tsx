import { getPointByAdminNumber } from "@/app/action/point";
import ButtonRedirect from "@/components/Button/ButtonRedirect";
import CardHeader from "@/components/Card/CardHeader";
import UserCard from "@/components/Card/UserCard";
import { MdError } from "react-icons/md";

const PointsPage = async ({ params }: { params: { id: string } }) => {
  const point = await getPointByAdminNumber(params.id);

  return (
    <UserCard>
      <CardHeader>Points Information</CardHeader>
      {point ? (
        <div className="mt-4">
          <h2 className="text-slate-800">
            <span className="font-medium text-amber-500">Admin Number: </span>
            {params.id}
          </h2>
          <h2 className="text-slate-800">
            <span className="font-medium text-amber-500">Balance: </span>
            {point.balance}
          </h2>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-y-2">
          <MdError size={100} className="text-red-500" />
          <h2 className="text-2xl font-semibold text-red-600">
            Oops! User not found
          </h2>
          <p className="text-slate-500">Start disposing now to earn points!</p>
        </div>
      )}
      <ButtonRedirect rounded href="/my-points" variant="outline" color="slate">
        Back
      </ButtonRedirect>
    </UserCard>
  );
};

export default PointsPage;
