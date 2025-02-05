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

// export const getWeeksInMonth = (dateFrom?: Date, dateTo?: Date) => {
//     const weeks = [];
//     const firstDayOfMonth = dateFrom ? new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1) : new Date();
//     const lastDayOfMonth = dateTo ? new Date(dateTo.getFullYear(), dateTo.getMonth() + 1, 0) : new Date();
//     let currentWeek = [];
//     for (let day = firstDayOfMonth; day <= lastDayOfMonth; day.setDate(day.getDate() + 1)) {
//       currentWeek.push(new Date(day));
//       if (day.getDay() === 0 || day.getDate() === lastDayOfMonth.getDate()) {
//         weeks.push(`Wk${weeks.length + 1}`);
//         currentWeek = [];
//       }
//     }
//     return weeks;
// };

const getWeekDatesByIndex = (date: Date, weekIndex: number) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(firstDayOfMonth);
  start.setDate(firstDayOfMonth.getDate() + (weekIndex * 7));
  
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  
  // Ensure end date doesn't exceed the month
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  if (end > lastDayOfMonth) {
    end.setDate(lastDayOfMonth.getDate());
  }
  
  return { start, end };
};

export const getWeeksInMonth = (dateFrom?: Date, dateTo?: Date) => {
  const weeks: { week: string; start: Date; end: Date }[] = [];
  const firstDayOfMonth = dateFrom ? new Date(dateFrom) : new Date();
  const lastDayOfMonth = dateTo 
    ? new Date(dateTo) 
    : new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);

  let currentDate = new Date(firstDayOfMonth);
  let weekIndex = 0;

  while (currentDate <= lastDayOfMonth) {
    const { start, end } = getWeekDatesByIndex(firstDayOfMonth, weekIndex);
    
    // Only add the week if it contains days within our target range
    if (start <= lastDayOfMonth && end >= firstDayOfMonth) {
      weeks.push({
        week: `Wk${weekIndex + 1}`,
        start,
        end
      });
    }
    
    weekIndex++;
    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
};

type FilterPeriod = "week" | "month" | "year" | "all time";

export const DateRange = (period: FilterPeriod) => {
    const now = new Date();
    
    switch (period) {
        case "week": {
        const monday = now.getDate() - ((now.getDay() + 6) % 7);
        
        const startDate = new Date(now.setDate(monday));
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now);
        endDate.setDate(monday + 6); // Add 6 days to get to Sunday
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
        }
        case "month": {
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
        }
        case "year": {
        const startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
        }
        case "all time": {
          return {startDate: undefined, endDate: undefined};
        }
    }
};
