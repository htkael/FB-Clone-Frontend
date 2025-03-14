import { useRef, useCallback, useEffect } from "react";
import UserCard from "./UserCard";
import { useAuth } from "../../context/AuthContext";

const UsersList = ({ page, data, setPage, isLoading, isFetching }) => {
  const loader = useRef(null);
  const currentUser = useAuth().user;

  // Check if data exists and has the expected structure
  const users = data?.data || [];

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.length > 0 ? (
        users.map((user) => {
          if (user.id === currentUser.id) return;
          return <UserCard key={user.id} user={user} page={page} />;
        })
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      <div ref={loader} className="col-span-full h-10 my-4">
        {isFetching && page > 1 && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-500 text-sm">Loading more users...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
