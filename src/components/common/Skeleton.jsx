import React from "react";

/**
 * Skeleton component for loading states
 * @param {string|number} width - Width of the skeleton
 * @param {string|number} height - Height of the skeleton
 * @param {string} className - Additional CSS classes
 * @param {string} variant - Shape variant: 'rectangular', 'circular', 'text', or 'avatar'
 * @param {string} animation - Animation type: 'pulse' or 'wave'
 * @param {boolean} withShimmer - Add a shimmer effect across the skeleton
 */
const Skeleton = ({
  width,
  height,
  className = "",
  variant = "rectangular",
  animation = "pulse",
  withShimmer = false,
}) => {
  let classes = `bg-gray-200 dark:bg-gray-700 ${className}`;

  if (animation === "pulse") {
    classes += " animate-pulse";
  } else if (animation === "wave") {
    classes += " animate-[skeleton-wave_1.8s_ease-in-out_0.5s_infinite]";
  }

  if (variant === "rectangular") {
    classes += " rounded";
  } else if (variant === "circular") {
    classes += " rounded-full";
  } else if (variant === "text") {
    classes += " rounded h-4";
  } else if (variant === "avatar") {
    classes += " rounded-full";
    height = height || width;
  }

  const style = {
    width: width,
    height: height,
  };

  return (
    <div className={`relative overflow-hidden ${classes}`} style={style}>
      {withShimmer && (
        <div
          className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{
            backgroundSize: "50% 100%",
          }}
        />
      )}
    </div>
  );
};

/**
 * Skeleton Text component for text placeholders
 */
Skeleton.Text = ({
  lines = 3,
  width,
  className = "",
  animation = "pulse",
  withShimmer = false,
}) => {
  return (
    <div className={`space-y-2 w-full ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={
            index === lines - 1 && typeof width === "string"
              ? width
              : width || "100%"
          }
          animation={animation}
          withShimmer={withShimmer}
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Avatar component for profile picture placeholders
 */
Skeleton.Avatar = ({
  size = "md",
  animation = "pulse",
  withShimmer = false,
}) => {
  const sizeMap = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <Skeleton
      variant="avatar"
      className={sizeMap[size]}
      animation={animation}
      withShimmer={withShimmer}
    />
  );
};

Skeleton.Card = ({
  height = "16rem",
  className = "",
  hasImage = true,
  imageHeight = "8rem",
  hasHeader = false,
  animation = "pulse",
  withShimmer = false,
}) => {
  return (
    <div
      className={`rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {hasHeader && (
        <div className="p-4 flex items-center space-x-3 border-b border-gray-200 dark:border-gray-700">
          <Skeleton.Avatar
            size="sm"
            animation={animation}
            withShimmer={withShimmer}
          />
          <div className="space-y-2 flex-1">
            <Skeleton
              variant="text"
              width="40%"
              animation={animation}
              withShimmer={withShimmer}
            />
            <Skeleton
              variant="text"
              width="20%"
              animation={animation}
              withShimmer={withShimmer}
            />
          </div>
        </div>
      )}
      {hasImage && (
        <Skeleton
          width="100%"
          height={imageHeight}
          variant="rectangular"
          className="rounded-none"
          animation={animation}
          withShimmer={withShimmer}
        />
      )}
      <div className="p-4 space-y-3">
        <Skeleton
          variant="text"
          width="80%"
          animation={animation}
          withShimmer={withShimmer}
        />
        <Skeleton.Text
          lines={2}
          animation={animation}
          withShimmer={withShimmer}
        />
        <div className="flex justify-between pt-2">
          <Skeleton
            width="20%"
            height="1.5rem"
            animation={animation}
            withShimmer={withShimmer}
          />
          <Skeleton
            width="20%"
            height="1.5rem"
            animation={animation}
            withShimmer={withShimmer}
          />
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
