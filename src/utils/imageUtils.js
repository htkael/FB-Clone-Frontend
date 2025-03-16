export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};

export const getRandomColor = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#2563EB",
    "#7C3AED",
    "#DB2777",
    "#DC2626",
    "#D97706",
    "#059669",
    "#4F46E5",
    "#0891B2",
  ];

  return colors[Math.abs(hash) % colors.length];
};
