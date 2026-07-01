export const getNameInitials = (name: string) => {
  const words = name.split(" ");
  const initials = words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
  return initials;
};
