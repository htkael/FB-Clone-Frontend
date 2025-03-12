const Badge = ({ count, className = "", size = "md" }) => {
  if (!count || count <= 0) return null;

  const sizeClasses = {
    sm: "px-1.5 py-0.5 text-xs min-w-[1.25rem] h-[1.25rem]",
    md: "px-2 py-0.5 text-xs min-w-[1.5rem] h-[1.5rem]",
    lg: "px-2 py-1 text-sm min-w-[1.75rem] h-[1.75rem]",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-red-500 text-white font-medium ${sizeClasses[size]} ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default Badge;
