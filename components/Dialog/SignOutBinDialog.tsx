import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SignOutBinForm from "@/components/Form/BinUserForms/SignOutBinForm";
import { getSessionUser } from "@/utils/getAuth";
import { PiSignOutBold } from "react-icons/pi";

const SignOutBinDialog = async () => {
  const user = await getSessionUser();
  return (
    <Dialog>
      <DialogTrigger className="bg-red-500 hover:bg-red-600 text-white lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-all h-full w-full">
        <div className="flex items-center justify-center gap-x-3">
          <PiSignOutBold />
          Sign out
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            You&apos;re about to sign out from your account. Any unsaved changes
            will be <span className="font-bold text-black">lost</span>. <br />
            Please enter your 6 digit passcode to continue
          </DialogDescription>
          {user?.id && <SignOutBinForm userId={user.id} />}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SignOutBinDialog;
