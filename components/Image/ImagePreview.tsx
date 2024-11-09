"use client";
import React, { useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";
import { Button } from "../ui/button";

const MIN_CROP_WIDTH = 30;
const STARTING_CROP_WIDTH = 50;
const ASPECT_RATIO = 1;

interface ImagePreviewProps {
  image: string;
  onDialogClose: (error: string | undefined) => void;
  onCropComplete: (file: File) => void;
}

const ImagePreview = ({
  image,
  onCropComplete,
  onDialogClose,
}: ImagePreviewProps) => {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState("");

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
      setCroppedImageUrl(croppedImageUrl);
      const file = dataURLToFile(
        croppedImageUrl,
        `${new Date().getTime()}.png`
      );
      onCropComplete(file);
    }
  };

  return (
    image && (
      <div>
        <ReactCrop
          keepSelection
          aspect={ASPECT_RATIO}
          minWidth={MIN_CROP_WIDTH}
          crop={crop}
          onComplete={(c) => setCrop(c)}
          onChange={(c) => setCrop(c)}
        >
          <img
            ref={imgRef}
            onLoad={handleImageLoad}
            className="max-w-full w-full h-auto border-2"
            src={image}
            alt="Preview"
          />
        </ReactCrop>
        <div className="flex gap-x-2">
          <Button
            type="button"
            className="bg-emerald-500 hover:bg-emerald-600 text-gray-50"
            onClick={handleCropSave}
          >
            Save
          </Button>

          <Button
            onClick={() => onDialogClose(undefined)}
            type="button"
            className="border border-emerald-500 bg-gray-50 text-emerald-500 hover:bg-emerald-50"
          >
            Cancel
          </Button>
        </div>
      </div>
    )
  );
};

export default ImagePreview;
