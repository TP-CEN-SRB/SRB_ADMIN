import CreateRewardForm from "@/components/FormLogic/RewardForms/CreateRewardForm";
import React from "react";

const RewardsCreatePage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-(--breakpoint-md) p-4">
      <CreateRewardForm />
    </div>
  );
};

export default RewardsCreatePage;
