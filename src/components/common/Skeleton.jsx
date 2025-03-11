const Skeleton = ({
  width,
  height,
  className = "",
  variant = "rectangular",
}) => {
  let classes = `animate-pulse bg-gray-200 ${className}`;

  if (variant === "rectangular") {
    classes += " rounded";
  } else if (variant === "circular") {
    classes += " rounded-full";
  } else if (variant === "text") {
    classes += " rounded h-4";
  }

  const style = {
    width: width,
    height: height,
  };

  return <div className={classes} style={style}></div>;
};

export default Skeleton;
