import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { userAPI } from "../services/api";
import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import MainLayout from "../components/layout/MainLayout";
import PostCard from "../components/feed/PostCard";
import PostForm from "../components/feed/PostForm";
import FriendButton from "../components/profile/FriendButton";
import ProfileStats from "../components/profile/ProfileStats";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileBio from "../components/profile/ProfileBio";
import ProfileTabs from "../components/profile/ProfileTabs";
import ErrorFallback from "../components/common/ErrorFallback";
import FriendsList from "../components/friends/FriendsList";
import Likes from "../components/profile/Likes";
import Skeleton from "../components/common/Skeleton";
import { formatDate } from "../utils/dateUtils";
import SettingsModal from "../components/settings/SettingsModal";
import RequestsList from "../components/profile/RequestsList";

// Import icons (assuming you're using heroicons)
import {
  DocumentTextIcon,
  PlusIcon,
  UserIcon,
  CalendarIcon,
  EnvelopeIcon,
  InformationCircleIcon,
  UserGroupIcon,
  HeartIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "posts"); // Initialize with a default tab
  const observer = useRef(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userAPI.getUser(userId),
    select: (response) => response.data,
    staleTime: 5 * 60 * 1000,
    onError: (error) => {
      console.error("Error fetching user profile", error);
    },
  });

  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isPostsLoading,
  } = useInfiniteQuery({
    queryKey: ["user-posts", userId],
    queryFn: ({ pageParam = 1 }) => {
      console.log("Fetching page", pageParam);
      return userAPI.getPostsFromUser(userId, { page: pageParam });
    },
    getNextPageParam: (lastPage) => {
      console.log("getNextPageParam called with", lastPage);
      if (!lastPage.data?.meta) return undefined;

      const hasMore = lastPage.data.meta.hasNext;
      const nextPage = hasMore ? lastPage.data.meta.page + 1 : undefined;
      console.log("Next page calculated:", nextPage);
      return nextPage;
    },
    enabled: activeTab === "posts",
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    // Update the active tab when the URL query parameter changes
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("posts"); // Default to posts if no tab is specified
    }
  }, [searchParams]);

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      console.log("Intersection observer triggered", {
        isIntersecting: entry.isIntersecting,
        hasNextPage,
        isFetchingNextPage,
      });
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        console.log("Fetching next page...");
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  const lastPostRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(handleObserver, {
        rootMargin: "100px",
      });
      if (node) observer.current.observe(node);
    },
    [handleObserver]
  );

  // Correctly access the nested post data structure
  const allPosts = useMemo(() => {
    if (!postsData) return [];

    // Extract all posts from all pages
    const allExtractedPosts = postsData.pages.flatMap((page) => {
      if (page.data && Array.isArray(page.data.data)) {
        return page.data.data;
      }
      return [];
    });

    // Deduplicate based on post IDs
    const uniquePosts = [];
    const seenIds = new Set();

    for (const post of allExtractedPosts) {
      if (!seenIds.has(post.id)) {
        seenIds.add(post.id);
        uniquePosts.push(post);
      }
    }

    return uniquePosts;
  }, [postsData]);

  const formatPostForDisplay = useCallback(
    (post) => {
      if (!post) return null;

      // Safely check for likes array
      const isLiked =
        post.likes?.some((like) => like.userId === parseInt(currentUser?.id)) ||
        false;

      return {
        ...post,
        isLiked,
        likesCount: post.likes?.length || post._count?.likes || 0,
        commentsCount: post.comments?.length || post._count?.comments || 0,
      };
    },
    [currentUser?.id]
  );

  // Filter out any null values that might result from formatPostForDisplay
  const displayPosts = useMemo(() => {
    return allPosts.map(formatPostForDisplay).filter((post) => post !== null);
  }, [allPosts, formatPostForDisplay]);

  if (profileError) {
    return (
      <MainLayout openModal={openSettingsModal}>
        <ErrorFallback
          error={profileError}
          resetErrorBoundary={() => navigate("/feed")}
        />
      </MainLayout>
    );
  }

  console.log("postData", postsData);

  // Determine if this is the current user's profile
  const isOwnProfile = parseInt(currentUser?.id) === parseInt(userId);

  const openSettingsModal = () => {
    setIsSettingsOpen(true);
  };

  return (
    <MainLayout openModal={openSettingsModal}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {isProfileLoading ? (
          <ProfileSkeleton />
        ) : (
          userProfile && (
            <>
              {/* Profile Header with Cover Photo */}
              <ProfileHeader
                user={userProfile.data}
                firstName={userProfile.data.firstName}
                lastName={userProfile.data.lastName}
                username={userProfile.data.username}
                profilePicUrl={userProfile.data.profilePicUrl}
              />

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  {/* Profile Info and Friend Button Section */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {userProfile.data.firstName} {userProfile.data.lastName}
                      </h1>
                      <p className="text-gray-600 dark:text-gray-400">
                        @{userProfile.data.username}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mt-1">
                        <CalendarIcon className="w-4 h-4 mr-1.5" />
                        <span>
                          Joined {formatDate(userProfile.data.createdAt)}
                        </span>
                      </div>
                    </div>

                    {!isOwnProfile && (
                      <FriendButton
                        userId={userId}
                        isFriend={userProfile.data.relationship?.isFriend}
                        friendshipStatus={
                          userProfile.data.relationship?.friendshipStatus
                        }
                      />
                    )}
                  </div>

                  {/* Profile Bio */}
                  <ProfileBio
                    bio={userProfile.data.bio}
                    userId={userId}
                    isOwnProfile={isOwnProfile}
                  />

                  {/* Profile Stats */}
                  <ProfileStats
                    postCount={userProfile.data.stats?.postCount || 0}
                    friendCount={userProfile.data.stats?.friendCount || 0}
                  />
                </div>

                {/* Profile Tabs */}
                {isOwnProfile ? (
                  <ProfileTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    currentUser={userProfile.data}
                  />
                ) : (
                  <ProfileTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    currentUser={userProfile.data}
                    tabs={[
                      { id: "posts", label: "Posts", icon: DocumentTextIcon },
                      { id: "about", label: "About", icon: UserIcon },
                      { id: "friends", label: "Friends", icon: UserGroupIcon },
                      { id: "likes", label: "Likes", icon: HeartIcon },
                    ]}
                  />
                )}
              </div>

              {/* Tab Content */}
              {activeTab === "posts" && (
                <div className="space-y-4">
                  {/* Post Form (only on own profile) */}
                  {isOwnProfile && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-4 border border-gray-200 dark:border-gray-700">
                      <PostForm />
                    </div>
                  )}

                  {/* Posts List */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                        Posts
                        {displayPosts && displayPosts.length > 0 && (
                          <span className="ml-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-0.5">
                            {displayPosts.length}
                          </span>
                        )}
                      </h2>
                    </div>

                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {isPostsLoading ? (
                        <div className="p-4 space-y-4">
                          <Skeleton.Card hasHeader={true} withShimmer />
                          <Skeleton.Card
                            hasHeader={true}
                            hasImage={true}
                            withShimmer
                          />
                        </div>
                      ) : displayPosts.length > 0 ? (
                        <div className="space-y-0 divide-y divide-gray-200 dark:divide-gray-700">
                          {displayPosts.map((post, index) => {
                            // Ensure a unique key with string conversion
                            const postKey = post.id
                              ? `post-id-${post.id}`
                              : `post-index-${index}`;

                            if (index === displayPosts.length - 1) {
                              return (
                                <div
                                  ref={lastPostRef}
                                  key={postKey}
                                  className="p-4"
                                >
                                  <PostCard post={post} />
                                </div>
                              );
                            }
                            return (
                              <div key={postKey} className="p-4">
                                <PostCard post={post} />
                              </div>
                            );
                          })}
                          {isFetchingNextPage && (
                            <div className="p-4">
                              <Skeleton.Card hasHeader={true} withShimmer />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 mb-4">
                            <UserIcon className="w-8 h-8" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                            No posts yet
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                            {isOwnProfile
                              ? "Share your thoughts or photos with your friends by creating your first post."
                              : `${userProfile.data.firstName} hasn't shared any posts yet.`}
                          </p>
                          {isOwnProfile && (
                            <button
                              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() =>
                                document.querySelector("textarea")?.focus()
                              }
                            >
                              <PlusIcon className="h-5 w-5 mr-2" />
                              Create a post
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <InformationCircleIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                      About
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium w-32 mb-2 sm:mb-0">
                          <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>Email</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {userProfile.data.email}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium w-32 mb-2 sm:mb-0">
                          <UserIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>Bio</span>
                        </div>
                        <div className="flex-1">
                          {userProfile.data.bio ? (
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                              {userProfile.data.bio}
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-500 italic">
                              No bio provided yet.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row">
                        <div className="flex items-center text-gray-700 dark:text-gray-300 font-medium w-32 mb-2 sm:mb-0">
                          <CalendarIcon className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                          <span>Status</span>
                        </div>
                        <div className="flex-1">
                          {userProfile.data.status ? (
                            <p className="text-gray-600 dark:text-gray-400">
                              {userProfile.data.status}
                            </p>
                          ) : (
                            <p className="text-gray-500 dark:text-gray-500 italic">
                              No status set
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "likes" && <Likes userProfile={userProfile} />}

              {activeTab === "friends" && (
                <FriendsList userProfile={userProfile} />
              )}
              {activeTab === "requests" && isOwnProfile && (
                <RequestsList
                  userProfile={userProfile}
                  isFriend={userProfile.data.relationship?.isFriend}
                  friendshipStatus={
                    userProfile.data.relationship?.friendshipStatus
                  }
                />
              )}
            </>
          )
        )}
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

const ProfileSkeleton = () => (
  <div className="space-y-4">
    <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-xl animate-pulse"></div>
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <Skeleton.Avatar size="xl" withShimmer />
            <div className="ml-4">
              <div className="bg-gray-200 dark:bg-gray-700 h-7 w-48 rounded animate-pulse mb-2"></div>
              <div className="bg-gray-200 dark:bg-gray-700 h-5 w-32 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-32 rounded-lg animate-pulse"></div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded-lg animate-pulse mb-6"></div>
        <div className="flex justify-between">
          <div className="bg-gray-200 dark:bg-gray-700 h-12 w-1/3 rounded-lg animate-pulse"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-12 w-1/3 rounded-lg animate-pulse"></div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700">
        <div className="flex p-4">
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-20 mx-2 rounded animate-pulse"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-20 mx-2 rounded animate-pulse"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-10 w-20 mx-2 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

export default Profile;
