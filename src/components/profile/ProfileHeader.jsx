import { useMemo } from "react";
import Avatar from "../common/Avatar";
import { getRandomColor } from "../../utils/imageUtils";

const ProfileHeader = ({ firstName, lastName, username, profilePicUrl }) => {
  const coverPattern = useMemo(() => {
    const baseColor = getRandomColor(username || "user");
    const secondaryColor = getRandomColor(firstName || "user");

    const patternId = `pattern-${
      username?.replace(/[^a-zA-Z0-9]/g, "") || "default"
    }`;

    return {
      patternId,
      baseColor,
      secondaryColor,
    };
  }, [username, firstName]);

  return (
    <div className="relative mb-16">
      {/* Cover Design (SVG Pattern) */}
      <div className="h-48 md:h-64 rounded-t-lg overflow-hidden">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={coverPattern.patternId}
              patternUnits="userSpaceOnUse"
              width="60"
              height="60"
              patternTransform="rotate(45)"
            >
              <rect width="100%" height="100%" fill={coverPattern.baseColor} />
              <circle
                cx="30"
                cy="30"
                r="20"
                fill={coverPattern.secondaryColor}
                fillOpacity="0.5"
              />
              <path
                d="M15 10 Q30 35, 45 10"
                stroke="white"
                strokeWidth="2"
                fill="none"
                strokeOpacity="0.3"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${coverPattern.patternId})`}
          />

          {/* Overlay gradient */}
          <rect width="100%" height="100%" fill="url(#headerGradient)" />
          <linearGradient
            id="headerGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop
              offset="0%"
              stopColor={coverPattern.baseColor}
              stopOpacity="0.7"
            />
            <stop
              offset="100%"
              stopColor={coverPattern.secondaryColor}
              stopOpacity="0.7"
            />
          </linearGradient>
        </svg>
      </div>

      {/* Profile Picture */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
        <div className="relative">
          <Avatar
            src={profilePicUrl}
            alt={`${firstName} ${lastName}`}
            size="xxl"
            className="border-4 border-white shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
