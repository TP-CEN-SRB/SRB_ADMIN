export const capitalizeFirstLetter = (s: string) => {
  return s
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
