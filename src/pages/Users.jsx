import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../services/api";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UsersList from "../components/users/UsersList";
import UserSearchModal from "../components/users/UserSearchModal";
import MainLayout from "../components/layout/MainLayout";
import ErrorFallback from "../components/common/ErrorFallback";

const Users = () => {
  const [users, setAllUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const navigate = useNavigate();

  const { data, isLoading, error, isFetching, isSuccess } = useQuery({
    queryKey: ["users", page],
    queryFn: async () => {
      const response = await userAPI.searchUser({
        firstName: filters.firstName,
        lastName: filters.lastName,
        username: filters.username,
      });
      return response;
    },
    keepPreviousData: true,
  });

  useEffect(() => {
    if (isSuccess && data?.data) {
      if (page === 1) {
        // Reset users list when filters change (page goes back to 1)
        setAllUsers(data.data);
      } else {
        // Append new users for subsequent pages
        setAllUsers((prevUsers) => [...prevUsers, ...data.data]);
      }
    }
  }, [isSuccess, data, page]);

  const handleFilterChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  if (error) {
    return (
      <MainLayout>
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => navigate("/feed")}
        />
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-white">Users</h1>

        <div className="mt-6 space-y-6">
          {isLoading && page === 1 && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading users...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <p className="text-red-700">
                Error loading users: {error.message}
              </p>
            </div>
          )}

          <UserSearchModal filters={filters} setFilters={handleFilterChange} />

          <UsersList
            data={users}
            setPage={setPage}
            isLoading={isLoading}
            isFetching={isFetching}
            hasNextPage={data?.meta?.hasNext}
            page={page}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
