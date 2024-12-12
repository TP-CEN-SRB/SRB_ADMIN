import { deleteBin } from "@/app/action/bin";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { useMediaQuery } from "react-responsive";
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
import CustomFormMessage from "../Form/CustomFormMessage";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface ConfirmDeleteBinDialogProps {
  binId: string;
  isOpen: boolean;
  handleDialogOpen: () => void;
}

const ConfirmDeleteBinDialog = ({
  binId,
  isOpen,
  handleDialogOpen,
}: ConfirmDeleteBinDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  const datetime = new Date().toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false, // 24-hour format, remove if 12-hour format is needed
  });
  const handleDelete = () => {
    startTransition(async () => {
      const data = await deleteBin(binId);
      setError(data?.error as string);
      if (!data.error && data.success !== undefined) {
        handleDialogOpen();
        toast({
          title: "Bin deleted successfully",
          description: (
            <div>
              Bin deleted at {datetime}
              <br />
              <br />
              <strong>Bin ID: </strong> {binId}
            </div>
          ),
          duration: 2000,
          variant: "default",
        });
        router.push("/admin/bin");
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
            You are about to delete bin {binId}
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
            onClick={handleDelete}
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
            You are about to delete user {binId}
          </DrawerDescription>
        </DrawerHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DrawerFooter>
          <Button
            disabled={isPending}
            onClick={handleDelete}
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

export default ConfirmDeleteBinDialog;
