import { useMemo } from "react";
import Avatar from "../common/Avatar";
import { getRandomColor } from "../../utils/imageUtils";
import Gravatar from "./Gravatar";

const ProfileHeader = ({ user, firstName, lastName, username }) => {
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
    <div className="relative mb-20">
      {/* Cover Design (SVG Pattern) */}
      <div className="h-48 md:h-64 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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

            <filter id="dropShadow" x="0" y="0" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="0" dy="0" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.2" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Base pattern */}
          <rect
            width="100%"
            height="100%"
            fill={`url(#${coverPattern.patternId})`}
          />

          {/* Overlay gradient */}
          <rect width="100%" height="100%" fill="url(#headerGradient)" />

          {/* Decorative elements */}
          <circle cx="15%" cy="30%" r="50" fill="white" fillOpacity="0.05" />
          <circle cx="85%" cy="70%" r="70" fill="white" fillOpacity="0.05" />

          {/* Bottom gradient for better text overlay */}
          <linearGradient id="bottomFade" x1="0%" y1="70%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="black" stopOpacity="0" />
            <stop offset="100%" stopColor="black" stopOpacity="0.3" />
          </linearGradient>
          <rect width="100%" height="100%" fill="url(#bottomFade)" />
        </svg>

        {/* Optional: Username display on the cover */}
        <div className="absolute bottom-3 left-4 text-white">
          <div className="text-lg font-medium drop-shadow-md">
            {firstName} {lastName}
          </div>
          <div className="text-sm opacity-90 drop-shadow-md">@{username}</div>
        </div>
      </div>

      {/* Profile Picture */}
      <Gravatar user={user} />
    </div>
  );
};

export default ProfileHeader;
