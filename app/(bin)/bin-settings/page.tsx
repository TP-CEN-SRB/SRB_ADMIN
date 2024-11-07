import React from "react";
import SignOutBinDialog from "@/components/Dialog/SignOutBinDialog";
import EmptyBinDialog from "@/components/Dialog/EmptyBinDialog";
import ButtonRedirect from "@/components/Button/ButtonRedirect";

const BinSettingsPage = async () => {
  return (
    <div className="flex flex-col justify-center items-center w-full max-w-[688px]">
      <h1 className="text-slate-800 mb-8">Settings</h1>
      <div className="grid grid-rows-2 gap-4 mb-8 min-h-[200px] w-full">
        <EmptyBinDialog />
        <SignOutBinDialog />
      </div>
      <ButtonRedirect rounded href="/" variant="outline" color="slate">
        Back
      </ButtonRedirect>
    </div>
  );
};

export default BinSettingsPage;
