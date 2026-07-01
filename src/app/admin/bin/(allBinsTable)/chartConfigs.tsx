type ChartConfig = {
  [key: string]: { label: string; color?: string } | string | number;
};

interface BarChartProps {
    materials: { [key: string]: string | number };
}

interface PieChartProps {
  DBPieChartData: { binType: string; binCount: number; fill?: string }[];
};

interface UserChartProps {
  userData: { [key: string]: string | number }; 
}

export const BarChartConfig = ({materials}: BarChartProps): ChartConfig => {
  return {
    binTotal: {
      label: "Total",
      color: "#0066CC",
    },
    bin: {
      label: "Bins",
      color: "#0066CC",
    },
    binToolTipLabel: {
      label: "Disposal Made Per Month",
    },
    ...Object.entries(materials).reduce(
      (acc, [material, _], index) => ({
        ...acc,
        [material]: {
          label: material,
          color: `hsl(${170 + index * 15}, 70%, 50%)`,
        },
      }),
      {}
    ),
  };
};

export const PieChartConfig = ({DBPieChartData}:PieChartProps): ChartConfig => {
  return {
    binCount: {
      label: "Count",
    },
    ...Object.entries(DBPieChartData).reduce(
      (acc, [material, _], index) => ({
        ...acc,
        [material]: {
          label: material,
          color: `hsl(${170 + index * 15}, 70%, 50%)`,
        },
      }),
      {}
    ),
  };
};

export const UserChartConfig = ({ userData }: UserChartProps): ChartConfig => {
  return {
    totalUsers: {
      label: "Total Users",
      color: "#4CAF50", 
    },
    userToolTipLabel: {
      label: "User Registrations Per Month",
      color: "#4CAF50",
    },
    ...Object.entries(userData).reduce(
      (acc, [month, _], index) => ({
        ...acc,
        [month]: {
          label: month,
          color: `hsl(${200 + index * 15}, 70%, 50%)`,
        },
      }),
      {}
    ),
  };
};

// export const binDisposalsTimeLineConfig: ChartConfig = {
//   totalDisposals: {
//     label: "Total Disposals",
//     color: "#0066CC",
//   },
//   binToolTipLabel: {
//     label: "Disposals Hourly",
//     color: "#0066CC",
//   },
//   ...Object.entries(materials).reduce(
//     (acc, [material, _], index) => ({
//       ...acc,
//       [material]: {
//         label: material,
//         color: `hsl(${170 + index * 15}, 70%, 50%)`,
//       },
//     }),
//     {}
//   ),
// };
