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

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun" ];

export const getYears = (startYear: number, endYear: number) => {
  return Array.from(
    { length: endYear - startYear - 1 },
    (_, i) => startYear + i
  );
};

export const getWeeksInMonth = (dateFrom?: Date, dateTo?: Date) => {
    const weeks = [];
    const firstDayOfMonth = dateFrom ? new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1) : new Date();
    const lastDayOfMonth = dateTo ? new Date(dateTo.getFullYear(), dateTo.getMonth() + 1, 0) : new Date();
    let currentWeek = [];
    for (let day = firstDayOfMonth; day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
      currentWeek.push(new Date(day));
      if (day.getDay() === 0 || day.getDate() === lastDayOfMonth.getDate()) {
        weeks.push(`Wk${weeks.length + 1}`);
        currentWeek = [];
      }
    }
    return weeks;
  };
