import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import EditAdminEmailForm from "@/components/FormLogic/AdminUserForms/EditAdminEmailForm";
import { useMediaQuery } from "react-responsive";
interface DialogProps {
  isOpen: boolean;
  handleDialogOpen: () => void;
}
const EditAdminEmailDialog = ({ isOpen, handleDialogOpen }: DialogProps) => {
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  });
  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">Change email address?</DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            We will send you a verification email to confirm your new email
            address
          </DialogDescription>
        </DialogHeader>
        <EditAdminEmailForm handleDialogOpen={handleDialogOpen} />
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onOpenChange={handleDialogOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl">Change email address?</DrawerTitle>
          <DrawerDescription className="text-slate-500 text-md">
            We will send you a verification email to confirm your new email
            address
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <EditAdminEmailForm handleDialogOpen={handleDialogOpen} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default EditAdminEmailDialog;
