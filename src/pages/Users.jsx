import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../services/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UsersList from "../components/users/UsersList";
import UserSearch from "../components/users/UserSearch";
import MainLayout from "../components/layout/MainLayout";
import ErrorFallback from "../components/common/ErrorFallback";
import SettingsModal from "../components/settings/SettingsModal";
import Skeleton from "../components/common/Skeleton";

// Import icons
import { UsersIcon } from "@heroicons/react/24/outline";

const Users = () => {
  const [users, setAllUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState("");
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data, isLoading, error, isFetching, isSuccess } = useQuery({
    queryKey: ["users", page, filters],
    queryFn: async () => {
      const response = await userAPI.searchUser({
        searchTerm: filters,
      });
      return response;
    },
    keepPreviousData: true,
  });
  console.log("users", data);

  useEffect(() => {
    if (isSuccess && data?.data) {
      if (page === 1) {
        // Reset users list when filters change (page goes back to 1)
        setAllUsers(data.data.data || []);
      } else {
        // Append new users for subsequent pages
        setAllUsers((prevUsers) => [...prevUsers, ...(data.data.data || [])]);
      }
    }
  }, [isSuccess, data, page]);

  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  const openSettingsModal = () => {
    setIsSettingsOpen(true);
  };

  if (error) {
    return (
      <MainLayout openModal={openSettingsModal}>
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => navigate("/feed")}
        />
      </MainLayout>
    );
  }

  console.log("SUERS", users);

  return (
    <MainLayout openModal={openSettingsModal}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <UsersIcon className="w-7 h-7 mr-2 text-blue-500 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 mb-6">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <UserSearch
              filters={filters}
              setFilters={handleFilterChange}
              page={page}
            />
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading && page === 1 ? (
              <div className="p-4 space-y-4">
                <Skeleton.Card hasHeader={true} withShimmer />
                <Skeleton.Card hasHeader={true} withShimmer />
                <Skeleton.Card hasHeader={true} withShimmer />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 p-4 m-4 rounded-r-lg">
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
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Error loading users:{" "}
                      {error.message || "Please try again later."}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <UsersList
                data={users}
                setPage={setPage}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
              />
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

export default Users;
