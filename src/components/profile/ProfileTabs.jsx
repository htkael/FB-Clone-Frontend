const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "about", label: "About" },
    { id: "friends", label: "Friends" },
    { id: "likes", label: "Likes" },
  ];

  return (
    <div className="border-t border-gray-200">
      <nav className="flex overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium text-sm focus:outline-none ${
              activeTab === tab.id
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default ProfileTabs;
