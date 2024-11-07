import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSessionUser } from "@/utils/getAuth";
import EmptyBinForm from "../Form/EmptyBinForm";
import { FaTrashArrowUp } from "react-icons/fa6";

const EmptyBinDialog = async () => {
  const user = await getSessionUser();
  return (
    <Dialog>
      <DialogTrigger className="bg-indigo-500 hover:bg-indigo-600 text-white lg:text-3xl md:text-2xl text-lg font-semibold py-4 rounded shadow-lg transition-all h-full w-full">
        <div className="flex gap-x-3 items-center justify-center">
          <FaTrashArrowUp /> Empty bins
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            Please enter your 6 digit passcode to continue
          </DialogDescription>
          {user?.id && <EmptyBinForm userId={user.id} />}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EmptyBinDialog;
