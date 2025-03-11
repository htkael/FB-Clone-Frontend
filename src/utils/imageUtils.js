export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ""}${
    lastName?.charAt(0) || ""
  }`.toUpperCase();
};

export const getRandomColor = (seed) => {
  // Generate a consistent color based on the seed (name or id)
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#2563EB", // Blue
    "#7C3AED", // Violet
    "#DB2777", // Pink
    "#DC2626", // Red
    "#D97706", // Amber
    "#059669", // Emerald
    "#4F46E5", // Indigo
    "#0891B2", // Cyan
  ];

  return colors[Math.abs(hash) % colors.length];
};
