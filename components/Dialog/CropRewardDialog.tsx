import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImagePreview from "../Image/ImagePreview";

interface DialogProps {
  isOpen: boolean;
  image: string;
  onDialogClose: (error: string | undefined) => void;
  onCropComplete: (file: File) => void;
}
const CropRewardDialog = ({
  isOpen,
  image,
  onDialogClose,
  onCropComplete,
}: DialogProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Resize your image</DialogTitle>
        </DialogHeader>
        <ImagePreview
          image={image}
          onCropComplete={onCropComplete}
          onDialogClose={onDialogClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CropRewardDialog;
