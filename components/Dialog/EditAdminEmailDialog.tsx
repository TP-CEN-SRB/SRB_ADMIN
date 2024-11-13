import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditAdminEmailForm from "@/components/Form/AdminUserForms/EditAdminEmailForm";
interface DialogProps {
  isOpen: boolean;
  handleDialogOpen: () => void;
}
const EditAdminEmailDialog = ({ isOpen, handleDialogOpen }: DialogProps) => {
  return (
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
  );
};

export default EditAdminEmailDialog;
