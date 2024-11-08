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
  handleOpen: () => void;
  onCropComplete: (file: File) => void;
}
const CropRewardDialog = ({
  isOpen,
  image,
  handleOpen,
  onCropComplete,
}: DialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resize your image</DialogTitle>
        </DialogHeader>
        <ImagePreview image={image} onCropComplete={onCropComplete} />
      </DialogContent>
    </Dialog>
  );
};

export default CropRewardDialog;
