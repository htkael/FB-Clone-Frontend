const EmptyState = ({
  title = "No data available",
  description = "There are no items to display at this time",
  icon = null,
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="text-gray-400 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
