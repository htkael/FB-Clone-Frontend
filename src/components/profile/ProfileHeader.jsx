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

        {/* Optional: Edit cover button - only show if it's the user's own profile */}
        {/* Uncomment and add logic to show this only for the user's own profile */}
        {/* 
        <button className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
        */}
      </div>

      {/* Profile Picture */}
      <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
        <div className="relative">
          <Avatar
            src={profilePicUrl}
            alt={`${firstName} ${lastName}`}
            size="xxl"
            className="border-4 border-white dark:border-gray-800 shadow-lg"
          />

          {/* Optional: Status indicator */}
          <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>

          {/* Optional: Edit profile picture button - only show if it's the user's own profile */}
          {/* Uncomment and add logic to show this only for the user's own profile */}
          {/* 
          <button className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-1.5 shadow-md transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          */}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
