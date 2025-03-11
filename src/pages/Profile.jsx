import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef, useCallback } from "react";
import PostForm from "../components/feed/PostForm";
import PostCard from "../components/feed/PostCard";

const Profile = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const loader = useRef(null);

  const {
    data: userResponse,
    isLoading,
    error,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ["user-posts", page],
    queryFn: async () => {
      const postsResponse = await userAPI.getPostsFromUser(user.id);
      const getUser = await userAPI.getUser(user.id);
      return { posts: postsResponse, user: getUser };
    },
  });

  useEffect(() => {
    if (isSuccess && userResponse?.posts.data) {
      if (page === 1) {
        console.log("User response", userResponse);
        setAllPosts(userResponse.posts.data);
      } else {
        setAllPosts((prevPosts) => {
          const newPostIds = new Set(
            userResponse.posts.data.map((post) => post.id)
          );
          const filteredPrevPosts = prevPosts.filter(
            (post) => !newPostIds.has(post.id)
          );
          return [...filteredPrevPosts, ...userResponse.posts.data];
        });
      }
    }
  }, [isSuccess, userResponse.posts, page]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isLoading &&
        !isFetching &&
        userResponse?.meta?.hasNext
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, isFetching, userResponse?.posts?.data?.meta?.hasNext]
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

  const formattedPostsForDisplay = useCallback((posts) => {
    if (posts.length < 1) {
      return [];
    }
    posts = posts.data;
    return posts.map((post) => {
      // Add UI properties like isLiked based on API data
      const isLiked = post.likes.some(
        (like) => like.userId === parseInt(localStorage.getItem("userId"))
      );

      return {
        ...post,
        isLiked,
        likesCount: post._count?.likes || 0,
        commentsCount: post._count?.comments || 0,
      };
    });
  }, []);

  const displayPosts = formattedPostsForDisplay(allPosts);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Your Feed</h1>

        <div className="mt-6 space-y-6">
          {isLoading && page === 1 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading your posts...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">
                Error loading posts: {error.message}
              </p>
            </div>
          )}

          {!isLoading && displayPosts.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 dark:text-gray-400">
                Your have no posts yet.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Create a new post to see content here!
              </p>
            </div>
          )}

          {displayPosts.length > 0 && (
            <>
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </>
          )}

          {/* Loading indicator for infinite scroll */}
          <div ref={loader} className="h-10 my-4">
            {isFetching && page > 1 && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-500 text-sm">
                  Loading more content...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
