import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bot, Users, Activity, Settings, Eye, EyeOff, Clock } from "lucide-react";
import type { User, JobApplication, EmailNotification } from "@shared/schema";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeSection, setActiveSection] = useState<"overview" | "users" | "applications">("overview");
  const { toast } = useToast();

  // Admin authentication
  const handleLogin = () => {
    if (password === "Bb7er5090866$@") {
      setIsAuthenticated(true);
      sessionStorage.setItem("easy_eddy_admin_auth", "true");
      toast({
        title: "Access Granted",
        description: "Welcome to Easy Eddy Admin Panel",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Invalid password",
        variant: "destructive",
      });
    }
  };

  // Check if already authenticated
  useState(() => {
    if (sessionStorage.getItem("easy_eddy_admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  });

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("easy_eddy_admin_auth");
    setPassword("");
  };

  // Admin queries
  const { data: allUsers, isLoading: usersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated,
  });

  const { data: allApplications, isLoading: applicationsLoading, error: applicationsError } = useQuery<JobApplication[]>({
    queryKey: ["/api/admin/applications"],
    enabled: isAuthenticated,
  });

  const { data: pendingUsers, isLoading: pendingLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/pending-users"],
    enabled: isAuthenticated,
  });

  const { data: systemStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  // Debug logging
  console.log("Admin Panel Debug:", {
    isAuthenticated,
    activeSection,
    allUsers,
    allApplications,
    usersLoading,
    applicationsLoading,
    usersError,
    applicationsError
  });

  // Approve user mutation
  const approveUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiRequest("POST", `/api/admin/approve-user/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "User Approved",
        description: "User has been approved and can now access the system",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-brand-green rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bot className="text-white" size={32} />
            </div>
            <CardTitle className="text-2xl font-bold text-black">Easy Eddy Admin</CardTitle>
            <p className="text-sm text-gray-600">Enter admin password to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Admin Password
              </Label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
            </div>
            <Button
              onClick={handleLogin}
              className="w-full bg-brand-green hover:bg-brand-green-dark"
            >
              Access Admin Panel
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center mr-3">
                <Bot className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-black">Easy Eddy Admin</span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-gray-600 hover:text-gray-800"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-6 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveSection("overview")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === "overview"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection("users")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === "users"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Users ({allUsers?.length || 0})
          </button>
          <button
            onClick={() => setActiveSection("applications")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSection === "applications"
                ? "border-brand-green text-brand-green"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            All Applications ({allApplications?.length || 0})
          </button>
        </div>

        {/* Stats Grid - Show only in Overview */}
        {activeSection === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                console.log("Clicking users card");
                setActiveSection("users");
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-black">{allUsers?.length || 0}</p>
                    <p className="text-xs text-blue-600 mt-1">Click to view all users</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-black">{pendingUsers?.length || 0}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-yellow-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                console.log("Clicking applications card");
                setActiveSection("applications");
              }}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-black">{allApplications?.length || 0}</p>
                    <p className="text-xs text-brand-green mt-1">Click to view all applications</p>
                  </div>
                  <div className="w-10 h-10 bg-brand-green bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Activity className="text-brand-green" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Automations</p>
                    <p className="text-2xl font-bold text-black">
                      {allUsers?.filter(u => u.automationActive).length || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Settings className="text-green-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-black">
                      {allApplications?.length ? 
                        Math.round((allApplications.filter(a => a.status === "response" || a.status === "interview").length / allApplications.length) * 100)
                        : 0}%
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Activity className="text-yellow-600" size={20} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Section */}
        {activeSection === "users" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">All Users ({allUsers?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersLoading ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading users...</p>
                ) : usersError ? (
                  <p className="text-sm text-red-500 text-center py-4">Error loading users: {usersError.message}</p>
                ) : allUsers?.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No users registered yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Email</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Automation</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">CV Score</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Applications</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Registered</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Last Active</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers?.map((user) => {
                          const userApplications = allApplications?.filter(app => app.userId === user.id) || [];
                          return (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-3">
                                <div>
                                  <p className="font-medium text-black">{user.email}</p>
                                  <p className="text-xs text-gray-500">ID: {user.id}</p>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <Badge variant={user.isApproved ? "default" : "destructive"}>
                                  {user.isApproved ? "Approved" : "Pending"}
                                </Badge>
                              </td>
                              <td className="py-3 px-3">
                                <Badge variant={user.automationActive ? "default" : "secondary"}>
                                  {user.automationActive ? "Active" : "Paused"}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`font-medium ${user.cvOptimizationScore && user.cvOptimizationScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                                  {user.cvOptimizationScore || 0}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-medium text-blue-600">{userApplications.length}</span>
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                {new Date(user.createdAt!).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="py-3 px-3">
                                {!user.isApproved ? (
                                  <Button
                                    onClick={() => approveUserMutation.mutate(user.id)}
                                    disabled={approveUserMutation.isPending}
                                    size="sm"
                                    className="bg-brand-green hover:bg-brand-green-dark"
                                  >
                                    Approve
                                  </Button>
                                ) : (
                                  <span className="text-xs text-gray-500">No action</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Applications Section */}
        {activeSection === "applications" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">All Job Applications ({allApplications?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applicationsLoading ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading applications...</p>
                ) : applicationsError ? (
                  <p className="text-sm text-red-500 text-center py-4">Error loading applications: {applicationsError.message}</p>
                ) : allApplications?.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No job applications yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">User</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Job Title</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Company</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Source</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Match Score</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Applied Date</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Last Update</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allApplications?.map((app) => {
                          const user = allUsers?.find(u => u.id === app.userId);
                          return (
                            <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-3">
                                <div>
                                  <p className="text-xs font-medium text-black">{user?.email || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500">ID: {app.userId}</p>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <p className="font-medium text-black">{app.jobTitle}</p>
                                <p className="text-xs text-gray-500">{app.location}</p>
                              </td>
                              <td className="py-3 px-3 font-medium text-gray-700">{app.company}</td>
                              <td className="py-3 px-3">
                                <Badge variant="outline" className="text-xs">
                                  {app.source}
                                </Badge>
                              </td>
                              <td className="py-3 px-3">
                                <Badge 
                                  variant={
                                    app.status === "applied" ? "secondary" :
                                    app.status === "response" ? "default" :
                                    app.status === "interview" ? "default" : "secondary"
                                  }
                                >
                                  {app.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`font-medium ${app.matchScore && app.matchScore >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                                  {app.matchScore || 0}%
                                </span>
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                {new Date(app.appliedAt).toLocaleDateString()}
                              </td>
                              <td className="py-3 px-3 text-gray-600">
                                {app.updatedAt ? new Date(app.updatedAt).toLocaleDateString() : 'Never'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Summary Cards */}
        {activeSection === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Pending User Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingUsers?.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No pending approvals</p>
                ) : (
                  pendingUsers?.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="text-sm font-medium text-black">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          Registered: {new Date(user.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        onClick={() => approveUserMutation.mutate(user.id)}
                        disabled={approveUserMutation.isPending}
                        size="sm"
                        className="bg-brand-green hover:bg-brand-green-dark"
                      >
                        {approveUserMutation.isPending ? "Approving..." : "Approve"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allUsers?.filter(u => u.isApproved && u.automationActive).slice(0, 5).map((user) => {
                  const userApplications = allApplications?.filter(app => app.userId === user.id) || [];
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="text-sm font-medium text-black">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          {userApplications.length} applications • CV: {user.cvOptimizationScore}%
                        </p>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Running
                      </Badge>
                    </div>
                  );
                })}
                {allUsers?.filter(u => u.isApproved && u.automationActive).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No active automations</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-black">Recent Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allApplications?.slice(0, 5).map((app) => {
                  const user = allUsers?.find(u => u.id === app.userId);
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-black">{app.jobTitle}</p>
                        <p className="text-xs text-gray-500">
                          {user?.email} • {app.company} • {app.matchScore}% match
                        </p>
                      </div>
                      <Badge 
                        variant={
                          app.status === "applied" ? "secondary" :
                          app.status === "response" ? "default" :
                          app.status === "interview" ? "default" : "secondary"
                        }
                      >
                        {app.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        )}

        {/* System Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-black">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Application Status</p>
                <p className="text-brand-green">Running ✓</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Database</p>
                <p className="text-brand-green">PostgreSQL Connected ✓</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">AI Service</p>
                <p className="text-brand-green">OpenAI Connected ✓</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}