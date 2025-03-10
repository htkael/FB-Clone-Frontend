const Logo = () => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle background */}
      <circle
        cx="20"
        cy="20"
        r="19"
        fill="#4B5563"
        stroke="#1F2937"
        strokeWidth="2"
      />

      {/* Larger mountain */}
      <path d="M7 30L16 14L20 22L24 14L33 30H7Z" fill="#D1D5DB" />
      <path d="M14 30L20 18L26 30H14Z" fill="#9CA3AF" />

      {/* Mountain peak */}
      <circle cx="20" cy="12" r="2" fill="#F3F4F6" />
    </svg>
  );
};

export default Logo;
