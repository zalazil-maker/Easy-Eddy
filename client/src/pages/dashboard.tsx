import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import Header from "@/components/dashboard/Header";
// ... other imports ...

export default function Dashboard() {
  const [, setLocation] = useLocation();
  
  // Existing user query
  const userId = parseInt(safeSessionStorageGet("easy_eddy_user_id") || "1");
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  // New query: test /api/hello endpoint
  const { data: helloData, isLoading: helloLoading, error: helloError } = useQuery(
    ["api-hello"],
    () =>
      fetch(`${process.env.REACT_APP_API_URL || ""}/api/hello`).then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
  );

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-robot text-white text-lg"></i>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to signin
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatusBanner userId={userId} />

        {/* Display your hello API data */}
        <div className="mb-6 p-4 border rounded bg-white">
          {helloLoading && <p>Loading API message...</p>}
          {helloError && <p className="text-red-500">Error loading API message</p>}
          {helloData && <p>API says: {helloData.message}</p>}
        </div>

        {/* Your other components */}
        {/* ... */}
      </main>
    </div>
  );
}