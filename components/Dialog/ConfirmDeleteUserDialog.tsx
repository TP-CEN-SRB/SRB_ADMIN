import React, { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "../ui/button";
import { toast } from "@/hooks/use-toast";
import { deleteUser } from "@/app/action/user";
import { Loader2 } from "lucide-react";
import CustomFormMessage from "../Form/CustomFormMessage";
import { useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";
interface DialogProps {
  userId: string;
  isOpen: boolean;
  handleDialogOpen: () => void;
}
const ConfirmDeleteUserDialog = ({
  userId,
  isOpen,
  handleDialogOpen,
}: DialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const handleConfirm = () => {
    startTransition(async () => {
      const data = await deleteUser(userId);
      setError(data?.error as string);
      if (!data.error && data.success !== undefined) {
        handleDialogOpen();
        toast({
          title: "Success!",
          description: data.success,
        });
        router.push("/admin/user");
      }
    });
  };
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });
  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">Are you sure?</DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            You are about to delete user {userId}
          </DialogDescription>
        </DialogHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            type="button"
            className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleConfirm}
            type="button"
            className="bg-red-500 hover:bg-red-600 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onOpenChange={handleDialogOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl">Are you sure?</DrawerTitle>
          <DrawerDescription className="text-slate-500 text-md">
            You are about to delete user {userId}
          </DrawerDescription>
        </DrawerHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DrawerFooter>
          <Button
            disabled={isPending}
            onClick={handleConfirm}
            type="button"
            className="bg-red-500 hover:bg-red-600 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Confirm"}
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            type="button"
            className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default ConfirmDeleteUserDialog;
