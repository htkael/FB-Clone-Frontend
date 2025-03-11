const ProfileStats = ({ postCount, friendCount }) => {
  return (
    <div className="flex flex-wrap gap-6 mt-4 text-center">
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900">{postCount}</span>
        <span className="text-sm text-gray-500">Posts</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xl font-bold text-gray-900">{friendCount}</span>
        <span className="text-sm text-gray-500">Friends</span>
      </div>
    </div>
  );
};

export default ProfileStats;
