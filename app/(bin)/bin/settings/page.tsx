import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SignOutBinForm from "@/components/Form/SignOutBinForm";
import { getSessionUser } from "@/utils/getAuth";

const BinSettingsPage = async () => {
  const user = await getSessionUser();
  return (
    <div className="flex flex-col justify-center items-center w-full">
      <h1 className="text-gray-800 mb-4">Settings</h1>
      <div className="grid grid-rows-2 gap-4 mb-8 min-h-[200px] w-full">
        <Dialog>
          <DialogTrigger className="bg-yellow-500 hover:bg-yellow-600 text-white lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-all h-full w-full">
            Empty Bin
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger className="bg-red-500 hover:bg-red-600 text-white lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-all h-full w-full">
            Sign out
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-3xl">
                Authentication Required
              </DialogTitle>
              <DialogDescription className="text-gray-500 mt-4 text-md">
                You&apos;re about to sign out from your account. Any unsaved
                changes will be{" "}
                <span className="font-bold text-black">lost</span>. <br />
                Please enter your 6 digit passcode to continue
              </DialogDescription>
              <SignOutBinForm userId={user?.id!} />
            </DialogHeader>
          </DialogContent>
        </Dialog>
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
