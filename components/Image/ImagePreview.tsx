// "use client";
// import React, { useRef, useState } from "react";
// import ReactCrop, {
//   centerCrop,
//   makeAspectCrop,
//   PixelCrop,
//   type Crop,
// } from "react-image-crop";

// const MIN_WIDTH = 100;
// const ASPECT_RATIO = 1;
// interface ImagePreviewProps {
//   image: string;
//   onCropComplete: (file: File) => void;
// }
// const ImagePreview = ({ image, onCropComplete }: ImagePreviewProps) => {
//   const [crop, setCrop] = useState<Crop>();
//   const imgRef = useRef<HTMLImageElement | null>(null);
//   const [croppedImageUrl, setCroppedImageUrl] = useState("");

//   const handleImageLoad = (
//     e: React.SyntheticEvent<HTMLImageElement, Event>
//   ) => {
//     const { width, height } = e.currentTarget;
//     const crop = makeAspectCrop(
//       { unit: "px", width: MIN_WIDTH },
//       ASPECT_RATIO,
//       width,
//       height
//     );
//     const centerdCrop = centerCrop(crop, width, height);
//     setCrop(centerdCrop);
//   };
//   const handleCropComplete = (crop: PixelCrop) => {
//     if (imgRef.current && crop.width && crop.height) {
//       const croppedImageUrl = getCroppedImg(imgRef.current, crop);
//       setCroppedImageUrl(croppedImageUrl);
//     }
//   };

//   const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop) => {
//     const canvas = document.createElement("canvas");
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;

//     canvas.width = crop.width * scaleX;
//     canvas.height = crop.height * scaleY;

//     const ctx = canvas.getContext("2d");
//     if (ctx) {
//       ctx.imageSmoothingEnabled = false;

//       ctx.drawImage(
//         image,
//         crop.x * scaleX,
//         crop.y * scaleY,
//         crop.width * scaleX,
//         crop.height * scaleY,
//         0,
//         0,
//         crop.width * scaleX,
//         crop.height * scaleY
//       );
//     }

//     return canvas.toDataURL("image/png"); // Returns base64 data URL
//   };
//   return (
//     image && (
//       <div>
//         <ReactCrop
//           keepSelection
//           aspect={ASPECT_RATIO}
//           minWidth={MIN_WIDTH}
//           crop={crop}
//           onComplete={handleCropComplete}
//           onChange={(c) => setCrop(c)}
//         >
//           <img
//             onLoad={handleImageLoad}
//             className="max-w-screen-lg w-full h-auto border-2"
//             src={image}
//             alt="Preview"
//           />
//         </ReactCrop>
//         <button type="submit" onClick={handleCropComplete}>
//           Done
//         </button>
//       </div>
//     )
//   );
// };

// export default ImagePreview;

"use client";
import React, { useRef, useState } from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  PixelCrop,
  type Crop,
} from "react-image-crop";

const MIN_WIDTH = 100;
const ASPECT_RATIO = 1;

interface ImagePreviewProps {
  image: string;
  onCropComplete: (file: File) => void;
}

const ImagePreview = ({ image, onCropComplete }: ImagePreviewProps) => {
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState("");

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const { width, height } = e.currentTarget;
    const crop = makeAspectCrop(
      { unit: "px", width: MIN_WIDTH },
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

  const handleCropButtonClick = () => {
    if (crop && imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop);
      setCroppedImageUrl(croppedImageUrl);
      const file = dataURLToFile(croppedImageUrl, "cropped-image.png");
      onCropComplete(file); // Notify parent component with the cropped file
    }
  };

  return (
    image && (
      <div>
        <ReactCrop
          keepSelection
          aspect={ASPECT_RATIO}
          minWidth={MIN_WIDTH}
          crop={crop}
          onComplete={(c) => setCrop(c)}
          onChange={(c) => setCrop(c)}
        >
          <img
            ref={imgRef}
            onLoad={handleImageLoad}
            className="max-w-screen-lg w-full h-auto border-2"
            src={image}
            alt="Preview"
          />
        </ReactCrop>

        <button type="button" onClick={handleCropButtonClick}>
          Crop and Save
        </button>

        {croppedImageUrl && (
          <div>
            <h3>Cropped Image:</h3>
            <img src={croppedImageUrl} alt="Cropped" />
          </div>
        )}
      </div>
    )
  );
};

export default ImagePreview;
