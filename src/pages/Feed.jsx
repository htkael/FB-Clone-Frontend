import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { postAPI } from "../services/api";
import MainLayout from "../components/layout/MainLayout";
import PostForm from "../components/feed/PostForm";
import PostCard from "../components/feed/PostCard";
import { useState, useEffect, useRef, useCallback } from "react";
import SettingsModal from "../components/settings/SettingsModal";

const Feed = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const loader = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    data: feedResponse,
    isLoading,
    error,
    isFetching,
    isSuccess,
  } = useQuery({
    queryKey: ["feed", page],
    queryFn: async () => {
      const response = await postAPI.getUserFeed(page);
      return response;
    },
  });

  // Update posts state when query data changes
  useEffect(() => {
    if (isSuccess && feedResponse?.data) {
      if (page === 1) {
        // Replace all posts when it's the first page
        setAllPosts(feedResponse.data);
      } else {
        // Append posts for subsequent pages
        setAllPosts((prevPosts) => {
          // Filter out duplicates (in case backend returns overlapping results)
          const newPostIds = new Set(feedResponse.data.map((post) => post.id));
          const filteredPrevPosts = prevPosts.filter(
            (post) => !newPostIds.has(post.id)
          );
          return [...filteredPrevPosts, ...feedResponse.data];
        });
      }
    }
  }, [isSuccess, feedResponse, page]);

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: postAPI.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      setPage(1); // Reset to first page after creating a post
    },
  });

  // Handle creating a new post
  const handleCreatePost = (postData) => {
    createPostMutation.mutate(postData);
  };

  // Infinite scroll handler using Intersection Observer
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

  // Set up the intersection observer
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
    if (posts.length < 1) {
      return [];
    }
    posts = posts.data;
    return posts.map((post) => {
      const isLiked = post.likes.some(
        (like) => like.userId === JSON.parse(localStorage.getItem("user")).id
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

  return (
    <MainLayout openModal={openSettingsModal}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Your Feed</h1>

        <PostForm
          onSubmit={handleCreatePost}
          isLoading={createPostMutation.isLoading}
        />

        <div className="mt-6 space-y-6">
          {isLoading && page === 1 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading your feed...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">
                Error loading feed: {error.message}
              </p>
            </div>
          )}

          {!isLoading && displayPosts.length === 0 && (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 dark:text-gray-400">
                Your feed is empty.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Create a new post or connect with friends to see content here!
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

      {isSettingsOpen && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </MainLayout>
  );
};

export default Feed;
