"use client";
import React from "react";
import ReactCrop, { type Crop } from "react-image-crop";

const MIN_CROP_WIDTH = 30;
const ASPECT_RATIO = 1;

interface ImagePreviewProps {
  image: string;
  crop: Crop | undefined;
  imgRef: React.LegacyRef<HTMLImageElement> | undefined;
  setCrop: (crop: Crop) => void;
  onImageLoad: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}
const ImagePreview = ({
  image,
  crop,
  imgRef,
  setCrop,
  onImageLoad,
}: ImagePreviewProps) => {
  return (
    image && (
      <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
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
            onLoad={onImageLoad}
            className="border-2"
            src={image}
            alt="Preview"
          />
        </ReactCrop>
      </div>
    )
  );
};

export default ImagePreview;
