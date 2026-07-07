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
]

export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat","Sun" ]

export const getYears = (startYear: number, endYear: number) => {
  return Array.from(
    { length: endYear - startYear - 1 },
    (_, i) => startYear + i
  )
}

// export const getWeeksInMonth = (dateFrom?: Date, dateTo?: Date) => {
//     const weeks = []
//     const firstDayOfMonth = dateFrom ? new Date(dateFrom.getFullYear(), dateFrom.getMonth(), 1) : new Date()
//     const lastDayOfMonth = dateTo ? new Date(dateTo.getFullYear(), dateTo.getMonth() + 1, 0) : new Date()
//     let currentWeek = []
//     for (let day = firstDayOfMonth day <= lastDayOfMonth day.setDate(day.getDate() + 1)) {
//       currentWeek.push(new Date(day))
//       if (day.getDay() === 0 || day.getDate() === lastDayOfMonth.getDate()) {
//         weeks.push(`Wk${weeks.length + 1}`)
//         currentWeek = []
//       }
//     }
//     return weeks
// }

type MonthlyData = {
  [key: string]: string | number
  month: string
  bin: number
}

// Helper function to ensure consistent timezone handling
export const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date)
  // Adjust to Singapore timezone (GMT+8)
  normalized.setHours(normalized.getHours() + 8)
  return normalized
}

const getWeekDatesByIndex = (date: Date, weekIndex: number) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  firstDayOfMonth.setHours(0, 0, 0, 0)
  
  const start = new Date(firstDayOfMonth)
  start.setDate(firstDayOfMonth.getDate() + (weekIndex * 7))
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  lastDayOfMonth.setHours(23, 59, 59, 999)
  
  if (end > lastDayOfMonth) {
    end.setTime(lastDayOfMonth.getTime())
  }
  
  return { 
    start: normalizeDate(start), 
    end: normalizeDate(end) 
  }
}

export const getWeeksInMonth = (dateFrom?: Date, dateTo?: Date): Array<{ week: string; start: Date; end: Date }> => {
  const firstDayOfMonth = dateFrom ? normalizeDate(new Date(dateFrom)) : normalizeDate(new Date())
  firstDayOfMonth.setHours(0, 0, 0, 0)
  
  const lastDayOfMonth = dateTo 
    ? normalizeDate(new Date(dateTo))
    : normalizeDate(new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0))
  lastDayOfMonth.setHours(23, 59, 59, 999)

  if (firstDayOfMonth > lastDayOfMonth) {
    console.warn('Invalid date range:', { firstDayOfMonth, lastDayOfMonth })
    return [{
      week: 'Wk1',
      start: firstDayOfMonth,
      end: firstDayOfMonth
    }]
  }

  const weeks: Array<{ week: string; start: Date; end: Date }> = []
  let currentDate = new Date(firstDayOfMonth)
  let weekIndex = 0

  while (currentDate <= lastDayOfMonth) {
    const { start, end } = getWeekDatesByIndex(firstDayOfMonth, weekIndex)
    
    if (start <= lastDayOfMonth && end >= firstDayOfMonth) {
      weeks.push({
        week: `Wk${weekIndex + 1}`,
        start,
        end
      })
    }
    
    weekIndex++
    currentDate.setDate(currentDate.getDate() + 7)
  }

  if (weeks.length === 0) {
    console.warn('No weeks generated, using fallback')
    weeks.push({
      week: 'Wk1',
      start: firstDayOfMonth,
      end: lastDayOfMonth
    })
  }

  return weeks
}

type FilterPeriod = "week" | "month" | "year" | "all time"

export const DateRange = (period: FilterPeriod) => {
    const now = new Date()
    
    switch (period) {
        case "week": {
        const monday = now.getDate() - ((now.getDay() + 6) % 7)
        
        const startDate = new Date(now.setDate(monday))
        startDate.setHours(0, 0, 0, 0)
        
        const endDate = new Date(now)
        endDate.setDate(monday + 6) // Add 6 days to get to Sunday
        endDate.setHours(23, 59, 59, 999)

        return { startDate, endDate }
        }
        case "month": {
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)

        return { startDate, endDate }
        }
        case "year": {
        const startDate = new Date(now.getFullYear(), 0, 1)
        startDate.setHours(0, 0, 0, 0)
        
        const endDate = new Date(now.getFullYear(), 11, 31)
        endDate.setHours(23, 59, 59, 999)

        return { startDate, endDate }
        }
        case "all time": {
          return {startDate: undefined, endDate: undefined}
        }
    }
}

export function getDateRangeType(startDate?: Date, endDate?:Date) {
  // Return undefined if either date is missing
  if (!startDate || !endDate) return undefined

  // Parse dates (handle both ISO strings and Date objects)
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Validate dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return undefined

  // Check for exact week difference (7 days)
  const weekLater = new Date(start)
  weekLater.setDate(start.getDate() + 7)
  if (weekLater.getTime() === end.getTime()) return 'week'

  // Check for exact month difference (same day next month)
  const nextMonth = new Date(start)
  nextMonth.setMonth(start.getMonth() + 1)
  if (nextMonth.getTime() === end.getTime()) return 'month'

  // Check for exact year difference (same day next year)
  const nextYear = new Date(start)
  nextYear.setFullYear(start.getFullYear() + 1)
  if (nextYear.getTime() === end.getTime()) return 'year'

  return undefined
}
