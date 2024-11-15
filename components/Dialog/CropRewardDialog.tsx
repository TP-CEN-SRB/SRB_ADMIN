import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImagePreview from "../Image/ImagePreview";
import { Button } from "../ui/button";
import { centerCrop, makeAspectCrop, type Crop } from "react-image-crop";

interface DialogProps {
  isOpen: boolean;
  image: string;
  onDialogClose: (error: string | undefined) => void;
  onCropComplete: (file: File) => void;
}
const MIN_CROP_WIDTH = 30;
const STARTING_CROP_WIDTH = 50;
const ASPECT_RATIO = 3 / 2;
const CropRewardDialog = ({
  isOpen,
  image,
  onDialogClose,
  onCropComplete,
}: DialogProps) => {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const { width, height, naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth < MIN_CROP_WIDTH || naturalHeight < MIN_CROP_WIDTH) {
      onDialogClose(
        "Image is too small. Please provide an image that is at least 50 x 50 pixels"
      );
    }
    const crop = makeAspectCrop(
      { unit: "px", width: STARTING_CROP_WIDTH },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(crop, width, height);
    setCrop(centeredCrop);
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY
      );
    }

    return canvas.toDataURL("image/png"); // Returns base64 data URL
  };

  // Convert the base64 URL to a File
  const dataURLToFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/);
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime ? mime[1] : "image/png" });
  };

  const handleCropSave = () => {
    if (crop && imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      const file = dataURLToFile(
        croppedImageUrl,
        `${new Date().getTime()}.png`
      );
      onCropComplete(file);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="[&>button]:hidden"
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl">Resize your image</DialogTitle>
        </DialogHeader>
        <ImagePreview
          crop={crop}
          setCrop={setCrop}
          imgRef={imgRef}
          image={image}
          onImageLoad={handleImageLoad}
        />
        <DialogFooter>
          <Button
            onClick={() => onDialogClose(undefined)}
            type="button"
            className="border border-emerald-500 bg-gray-50 text-emerald-500 hover:bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-emerald-500 hover:bg-emerald-600 text-gray-50"
            onClick={handleCropSave}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CropRewardDialog;
