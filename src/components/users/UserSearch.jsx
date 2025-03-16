import { useState, useEffect } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import { useQueryClient } from "@tanstack/react-query";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

const UserSearch = ({ filters, setFilters, page }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!filters) {
      setSearchTerm("");
    }
  }, [filters]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm === "") return;

      if (searchTerm.length < 2) {
        return;
      }

      setIsSearching(true);
      try {
        setFilters(searchTerm);
        queryClient.invalidateQueries({ queryKey: ["users", page] });
      } catch (error) {
        console.error("Error searching users:", error);
        setFilters("");
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, setFilters, queryClient, page]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilters("");
    queryClient.invalidateQueries({ queryKey: ["users", page] });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      clearFilters();
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Input
            label="Find Users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name or username"
            leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
            className="pr-10"
          />

          {/* Spinner for loading state */}
          {isSearching && (
            <div className="absolute right-3 top-[38px]">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Clear button inside input */}
          {searchTerm && !isSearching && (
            <button
              onClick={clearFilters}
              className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* External clear button - only show on smaller screens or when there are active filters */}
        {filters && (
          <div className="self-end sm:hidden">
            <Button
              variant="outline"
              size="md"
              onClick={clearFilters}
              icon={<XMarkIcon className="w-4 h-4" />}
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Search instruction and active filter indicator */}
      <div className="mt-1.5 flex flex-wrap items-center gap-2">
        {searchTerm && searchTerm.length < 2 ? (
          <p className="text-sm text-amber-500 dark:text-amber-400 flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 mr-1.5"></span>
            Please enter at least 2 characters to search
          </p>
        ) : filters ? (
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-400 mr-1.5"></span>
            Showing results for "{filters}"
            <button
              onClick={clearFilters}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Clear
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Search for users by name or username
          </p>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
