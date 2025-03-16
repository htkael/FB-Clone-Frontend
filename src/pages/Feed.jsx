import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import PostForm from "../components/feed/PostForm";
import PostCard from "../components/feed/PostCard";
import { useState, useEffect, useRef, useCallback } from "react";
import SettingsModal from "../components/settings/SettingsModal";
import Skeleton from "../components/common/Skeleton";
import { useAuth } from "../context/AuthContext";
import FeedFriendsList from "../components/feed/FeedFriendsList";
import FeedLayout from "../components/layout/FeedLayout";

import {
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";

const Feed = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const loader = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = useAuth();

  const {
    data: feedResponse,
    isLoading,
    error,
    isFetching,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: ["feed", page],
    queryFn: async () => {
      const response = await postAPI.getUserFeed({ page });
      return response.data;
    },
  });

  useEffect(() => {
    if (isSuccess && feedResponse) {
      const newPosts = feedResponse.data || [];

      if (page === 1) {
        setAllPosts(newPosts);
      } else {
        setAllPosts((prevPosts) => {
          const newPostIds = new Set(newPosts.map((post) => post.id));

          const filteredPrevPosts = prevPosts.filter(
            (post) => !newPostIds.has(post.id)
          );

          return [...filteredPrevPosts, ...newPosts];
        });
      }
    }
  }, [isSuccess, feedResponse, page]);

  const createPostMutation = useMutation({
    mutationFn: postAPI.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setPage(1);
    },
  });

  const handleCreatePost = (postData) => {
    createPostMutation.mutate(postData);
  };

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        !isLoading &&
        !isFetching &&
        feedResponse?.meta?.hasNext
      ) {
        setPage((prev) => prev + 1);
      }
    },
    [isLoading, isFetching, feedResponse?.meta?.hasNext]
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

  const formatPostsForDisplay = useCallback((posts) => {
    if (!Array.isArray(posts) || posts.length < 1) {
      return [];
    }

    return posts.map((post) => {
      const isLiked = post.likes?.some(
        (like) => like.userId === JSON.parse(localStorage.getItem("user"))?.id
      );

      return {
        ...post,
        isLiked,
        likesCount: post._count?.likes || 0,
        commentsCount: post._count?.comments || 0,
      };
    });
  }, []);

  const displayPosts = formatPostsForDisplay(allPosts);

  const openSettingsModal = () => {
    setIsSettingsOpen(true);
  };

  const handleRefresh = () => {
    setPage(1);
    setAllPosts([]);
    refetch();
  };

  return (
    <FeedLayout openModal={openSettingsModal}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col justify-around lg:flex-row lg:space-x-10">
          {/* Main Feed Column */}
          <div className="flex-1 max-w-2xl mx-auto lg:mx-0">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Your Feed
              </h1>

              <div className="flex items-center space-x-2">
                {/* Refresh button */}
                <button
                  onClick={handleRefresh}
                  disabled={isLoading || isFetching}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Refresh feed"
                  title="Refresh feed"
                >
                  <ArrowPathIcon
                    className={`w-5 h-5 ${
                      (isLoading || isFetching) && "animate-spin"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <PostForm
                onSubmit={handleCreatePost}
                isLoading={createPostMutation.isLoading}
              />
            </div>

            <div className="space-y-4">
              {isLoading && page === 1 && (
                <>
                  <Skeleton.Card
                    hasHeader={true}
                    hasImage={false}
                    withShimmer
                  />
                  <Skeleton.Card hasHeader={true} hasImage={true} withShimmer />
                  <Skeleton.Card
                    hasHeader={true}
                    hasImage={false}
                    withShimmer
                  />
                </>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 rounded-r-lg mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Error loading feed:{" "}
                        {error.message || "Please try again later."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isLoading && displayPosts.length === 0 && (
                <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No posts yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Your feed is empty. Create a new post or connect with
                    friends to see content here!
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
              <div ref={loader} className="h-20 my-4">
                {isFetching && page > 1 && (
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading more posts...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Friends List Column - Only visible on large screens */}
          <div className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-6">
              {isLoading ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 min-h-96">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="p-3">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                          </div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : user ? (
                <FeedFriendsList userProfile={user} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">
                    Unable to load friends list.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </FeedLayout>
  );
};

export default Feed;
