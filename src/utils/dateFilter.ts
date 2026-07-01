export const formatDateTime = (date: Date = new Date()) => {
  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const formattedTime = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).toLowerCase();

  return `${formattedDate}, ${formattedTime}`;
};

// Additional utility functions for flexibility
export const formatDate = (date: Date = new Date()) => {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatTime = (date: Date = new Date()) => {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).toLowerCase();
};