import { useState, useEffect } from "react";
import Button from "../common/Button";
import Input from "../common/Input";
import { useQueryClient } from "@tanstack/react-query";

const UserSearch = ({ filters, setFilters, page }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  // Reset search term when filters are cleared externally
  useEffect(() => {
    if (!filters) {
      setSearchTerm("");
    }
  }, [filters]);

  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm === "") return;

      // Handle short search terms
      if (searchTerm.length < 2) {
        return; // Don't clear filters, just exit
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

  return (
    <div className="mb-6">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            label="Search Users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by first name, last name, or username"
          />
          {isSearching && (
            <div className="absolute right-3 top-[38px]">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        {searchTerm && (
          <div className="self-end">
            <Button variant="outline" size="md" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        )}
      </div>
      {searchTerm && searchTerm.length < 2 && (
        <p className="text-sm text-gray-500 mt-1">
          Please enter at least 2 characters to search
        </p>
      )}
    </div>
  );
};

export default UserSearch;
