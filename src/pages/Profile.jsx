import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { userAPI } from "../services/api";
import { useState, useRef, useCallback } from "react";
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
import { formatDate } from "../utils/dateUtils";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "posts"); // Initialize with a default tab
  const observer = useRef(null);
  console.log("search params", searchParams);
  console.log("tab", tabFromUrl);

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
    queryFn: ({ pageParam = 1 }) =>
      userAPI.getPostsFromUser(userId, { page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNext ? lastPage.meta.page + 1 : undefined,
    select: (data) => ({
      pages: data.pages.map((page) => page.data || []),
      pageParams: data.pageParams,
    }),
    enabled: activeTab === "posts",
    staleTime: 60 * 1000,
  });

  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  // Fixed syntax error in the callback reference
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

  // Safely extract posts to avoid undefined errors
  const allPosts = postsData
    ? postsData.pages.flatMap((page) => page.data || [])
    : [];

  const formatPostForDisplay = useCallback(
    (post) => {
      if (!post) return null;

      // Safely check for likes array
      const isLiked =
        post.likes?.some(
          (like) => like.user?.id === parseInt(currentUser?.id)
        ) || false;

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
  const displayPosts = allPosts
    .map(formatPostForDisplay)
    .filter((post) => post !== null);

  if (profileError) {
    return (
      <MainLayout>
        <ErrorFallback
          error={profileError}
          resetErrorBoundary={() => navigate("/feed")}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        {isProfileLoading ? (
          <ProfileSkeleton />
        ) : (
          userProfile && (
            <>
              {/* Profile Header with Cover Photo */}
              <ProfileHeader
                firstName={userProfile.data.firstName}
                lastName={userProfile.data.lastName}
                username={userProfile.data.username}
                profilePicUrl={userProfile.data.profilePicUrl}
              />

              <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                <div className="p-6">
                  {/* Profile Info and Friend Button Section */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {userProfile.data.firstName} {userProfile.data.lastName}
                      </h1>
                      <p className="text-gray-600">
                        @{userProfile.data.username}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Joined {formatDate(userProfile.data.createdAt)}
                      </p>
                    </div>

                    {parseInt(currentUser?.id) !== parseInt(userId) && (
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
                    isOwnProfile={
                      parseInt(currentUser?.id) === parseInt(userId)
                    }
                  />

                  {/* Profile Stats */}
                  <ProfileStats
                    postCount={userProfile.data.stats?.postCount || 0}
                    friendCount={userProfile.data.stats?.friendCount || 0}
                  />
                </div>

                {/* Profile Tabs */}
                <ProfileTabs
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>

              {/* Tab Content */}
              {activeTab === "posts" && (
                <div className="space-y-4">
                  {/* Post Form (only on own profile) */}
                  {parseInt(currentUser?.id) === parseInt(userId) && (
                    <PostForm />
                  )}

                  {/* Posts List */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Posts {displayPosts && `(${displayPosts.length})`}
                      </h2>
                    </div>
                    <div className="p-4">
                      {isPostsLoading ? (
                        <PostsSkeleton count={3} />
                      ) : displayPosts.length > 0 ? (
                        <div className="space-y-4">
                          {displayPosts.map((post, index) => {
                            if (index === displayPosts.length - 1) {
                              return (
                                <div ref={lastPostRef} key={post.id}>
                                  <PostCard post={post} />
                                </div>
                              );
                            }
                            return <PostCard key={post.id} post={post} />;
                          })}
                          {isFetchingNextPage && <PostsSkeleton count={1} />}
                        </div>
                      ) : (
                        <div className="bg-white rounded-lg shadow-md p-6 text-center">
                          <p className="text-gray-500">No posts to display</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "about" && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                      About
                    </h2>
                  </div>

                  <div className="p-6">
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 pb-4">
                        <p className="text-gray-700 font-medium w-32">Email</p>
                        <p className="text-gray-600">
                          {userProfile.data.email}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row border-b border-gray-100 pb-4">
                        <p className="text-gray-700 font-medium w-32">Bio</p>
                        <div className="flex-1">
                          {userProfile.data.bio ? (
                            <p className="text-gray-600">
                              {userProfile.data.bio}
                            </p>
                          ) : (
                            <p className="text-gray-500 italic">
                              No bio provided yet.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row">
                        <p className="text-gray-700 font-medium w-32">Status</p>
                        <div className="flex-1">
                          {userProfile.data.status ? (
                            <p className="text-gray-600">
                              {userProfile.data.status}
                            </p>
                          ) : (
                            <p className="text-gray-500 italic">
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
            </>
          )
        )}
      </div>
    </MainLayout>
  );
};

const ProfileSkeleton = () => (
  <div className="space-y-4">
    <div className="bg-gray-200 h-40 rounded-lg animate-pulse"></div>
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <div className="bg-gray-200 h-16 w-16 rounded-full animate-pulse mr-4"></div>
        <div className="flex-1">
          <div className="bg-gray-200 h-6 w-2/3 rounded animate-pulse mb-2"></div>
          <div className="bg-gray-200 h-4 w-1/3 rounded animate-pulse"></div>
        </div>
      </div>
      <div className="bg-gray-200 h-20 rounded animate-pulse mb-4"></div>
      <div className="flex justify-between">
        <div className="bg-gray-200 h-10 w-1/4 rounded animate-pulse"></div>
        <div className="bg-gray-200 h-10 w-1/4 rounded animate-pulse"></div>
        <div className="bg-gray-200 h-10 w-1/4 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

const PostsSkeleton = ({ count }) => (
  <>
    {Array(count)
      .fill(0)
      .map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 animate-pulse"
        >
          <div className="flex items-center mb-4">
            <div className="bg-gray-200 h-10 w-10 rounded-full mr-3"></div>
            <div>
              <div className="bg-gray-200 h-4 w-32 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 w-24 rounded"></div>
            </div>
          </div>
          <div className="bg-gray-200 h-24 rounded mb-4"></div>
          <div className="flex justify-between">
            <div className="bg-gray-200 h-8 w-16 rounded"></div>
            <div className="bg-gray-200 h-8 w-16 rounded"></div>
          </div>
        </div>
      ))}
  </>
);

export default Profile;
