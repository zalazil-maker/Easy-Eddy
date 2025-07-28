import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Reply, Calendar, Search } from "lucide-react";

interface StatsGridProps {
  userId: number;
}

export default function StatsGrid({ userId }: StatsGridProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/users", userId, "stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      label: "Applications Sent",
      value: stats?.applicationsSent || 0,
      change: "+6 from yesterday",
      icon: Send,
      iconColor: "text-brand-green",
      bgColor: "bg-brand-green bg-opacity-10",
    },
    {
      label: "Responses",
      value: stats?.responses || 0,
      change: `${stats?.applicationsSent ? Math.round((stats.responses / stats.applicationsSent) * 100) : 0}% response rate`,
      icon: Reply,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Interviews",
      value: stats?.interviews || 0,
      change: `${stats?.applicationsSent ? Math.round((stats.interviews / stats.applicationsSent) * 100) : 0}% conversion rate`,
      icon: Calendar,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Active Searches",
      value: stats?.activeSearches || 0,
      change: "Across 12 platforms",
      icon: Search,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index} className="border border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-black">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={stat.iconColor} size={20} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
