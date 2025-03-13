import { useRef, useCallback, useEffect } from "react";

const UsersList = ({
  page,
  data,
  setPage,
  isLoading,
  isFetching,
  hasNextPage,
}) => {
  const loader = useRef(null);
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

  console.log("Users Found!", data);

  //   const formatUsersForDisplay = useCallback((users) => {
  //     if (users.length < 1) {
  //         return []
  //     }
  //     users = users.data

  //     return users.map((user) => {
  //         const is
  //     })
  //   })

  return (
    <div ref={loader} className="h-10 my-4">
      {isFetching && page > 1 && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading more content...</p>
        </div>
      )}
    </div>
  );
};

export default UsersList;
