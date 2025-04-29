// src/components/UserList.tsx
import { useState, useEffect } from "react";

// Define types for a single user object
interface User {
  id: number; // Assuming ID is a number, adjust if it's a string
  first_name: string;
  last_name: string;
  email: string;
  created_at: string; // Assuming date is returned as a string
  // Add any other properties the user object might have from the API
}

// Define type for the component's props
interface UserListProps {
  refreshTrigger?: number | boolean; // Type for the prop used to trigger refresh. Use a type that changes.
}

// Define a type for the expected API response structure
interface UserListApiResponse {
  success?: boolean; // success is optional based on the logic
  message?: string; // message is optional based on the logic
  users?: User[]; // The array of users, matches the User interface
}

function UserList({ refreshTrigger }: UserListProps) {
  // Use defined props type
  const [users, setUsers] = useState<User[]>([]); // Type state as an array of User objects
  const [error, setError] = useState<string>(""); // Explicitly type as string
  const [isLoading, setIsLoading] = useState<boolean>(false); // Explicitly type as boolean

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5001/api/users"); // Fetch from the backend endpoint

      // Use the defined API response type
      const result: UserListApiResponse = await response.json();

      if (!response.ok) {
        // Use optional chaining ?. for safety
        setError(result?.message || `Error: ${response.statusText}`);
      } else if (result?.success) {
        // Check result.success if it exists
        // Check if result.users exists and is an array before setting state
        if (result.users && Array.isArray(result.users)) {
          setUsers(result.users);
        } else {
          // Handle unexpected response structure
          setError(
            result?.message ||
              "Successfully fetched, but user data format is unexpected."
          );
          setUsers([]); // Clear users if format is wrong
        }
      } else {
        // Handle cases where response is ok but operation failed (e.g., no users)
        // Use optional chaining ?. for safety
        setError(result?.message || "Failed to fetch users.");
        setUsers([]); // Clear users on failure
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      // Type assertion for err if you need to access specific properties
      setError(
        "Could not connect to the server or an unexpected error occurred."
      );
      setUsers([]); // Clear users on fetch error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users on component mount and when refreshTrigger changes
  useEffect(() => {
    fetchUsers();
    // Add fetchUsers to dependencies as it's used inside useEffect,
    // but wrap it in useCallback if it depends on external state
    // to prevent infinite loops if external state changes frequently.
    // In this simple case, it's fine as it is.
  }, [refreshTrigger]); // Re-run useEffect when refreshTrigger changes

  return (
    <div className="mt-10 w-full max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Registered Users</h2>

      {isLoading && (
        <p className="text-center">
          <span className="loading loading-dots loading-md"></span>
        </p>
      )}
      {error && (
        <div role="alert" className="alert alert-warning">
          <span>{error}</span>
        </div>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="table w-full">
            {/* head */}
            <thead className="bg-base-200">
              <tr>
                <th>ID</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Registered At</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((user) => (
                // Ensure user has a unique key, user.id is used here
                <tr key={user.id} className="hover">
                  <th>{user.id}</th>
                  <td>{user.first_name}</td>
                  <td>{user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Manual Refresh Button */}
      <div className="text-center mt-4">
        <button
          className="btn btn-sm btn-outline"
          onClick={fetchUsers}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            "Refresh List"
          )}
        </button>
      </div>
    </div>
  );
}

export default UserList;
