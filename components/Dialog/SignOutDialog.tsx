import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { logout } from "@/app/action/user";
interface DialogProps {
  isOpen: boolean;
  handleDialogOpen: () => void;
}
const SignOutDialog = ({ isOpen, handleDialogOpen }: DialogProps) => {
  const [isPending, startTransition] = useTransition();
  const logOut = () => {
    startTransition(async () => {
      handleDialogOpen();
      await logout();
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">Are you sure?</DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            You&apos;re about to sign out from your account. Any unsaved changes
            will be <span className="font-bold text-black">lost</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-3">
          <Button
            onClick={logOut}
            type="submit"
            disabled={isPending}
            className="bg-red-500 hover:bg-red-600 text-gray-50 text-xl font-semibold p-6 min-w-56 rounded-full transition-all"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Sign out"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignOutDialog;
