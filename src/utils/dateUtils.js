import { formatDistanceToNow } from "date-fns";

export const formatDate = (dateString) => {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString("en-US", options);
};

export const timeAgo = (dateString) => {
  const formattedDate = formatDistanceToNow(new Date(dateString), {
    addSuffix: true,
  });
  return formattedDate;
};
