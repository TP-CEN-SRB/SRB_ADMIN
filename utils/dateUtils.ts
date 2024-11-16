export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getYears = (startYear: number, endYear: number) => {
  return Array.from(
    { length: endYear - startYear - 1 },
    (_, i) => startYear + i
  );
};
