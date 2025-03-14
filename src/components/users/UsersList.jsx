import { useRef, useCallback, useEffect } from "react";
import UserCard from "./UserCard";
import { useAuth } from "../../context/AuthContext";
import Skeleton from "../common/Skeleton";

// Import icons
import { UsersIcon } from "@heroicons/react/24/outline";

const UsersList = ({ page, data, setPage, isLoading, isFetching }) => {
  const loader = useRef(null);
  const currentUser = useAuth().user;

  // Check if data exists and has the expected structure
  const users = data || [];

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isLoading &&
        !isFetching &&
        data?.meta?.hasNext
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, isFetching, data?.meta?.hasNext, setPage]
  );

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(handleObserver, options);

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [handleObserver]);

  // Filter out current user from the list
  const filteredUsers = users.filter((user) => user.id !== currentUser?.id);

  if (filteredUsers.length === 0 && !isFetching && !isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
          <UsersIcon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          No users found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Try searching with different keywords or check back later for new
          users
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {filteredUsers.map((user) => (
          <UserCard key={user.id} user={user} page={page} />
        ))}
      </div>

      <div ref={loader} className="h-16 my-4">
        {isFetching && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Loading more users...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
