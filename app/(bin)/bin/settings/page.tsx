import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import SignOutBinDialog from "@/components/Dialog/SignOutBinDialog";
import EmptyBinDialog from "@/components/Dialog/EmptyBinDialog";

const BinSettingsPage = async () => {
  return (
    <div className="flex flex-col justify-center items-center w-full max-w-[688px]">
      <h1 className="text-gray-800 mb-8">Settings</h1>
      <div className="grid grid-rows-2 gap-4 mb-8 min-h-[200px] w-full">
        <EmptyBinDialog />
        <SignOutBinDialog />
      </div>
      <Button
        asChild
        className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-8 px-8 rounded-full shadow-lg transition-all mt-4 min-w-56"
      >
        <Link href="/">Back</Link>
      </Button>
    </div>
  );
};

export default BinSettingsPage;
