import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bell, Bot, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ProfileToggle from "./ProfileToggle";
import Notifications from "./Notifications";
import type { User } from "@shared/schema";

interface HeaderProps {
  user: User;
}

export default function Header({ user }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Get unread notifications count
  const { data: unreadNotifications = [] } = useQuery({
    queryKey: ['/api/users', user.id, 'notifications', 'unread'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getInitials = (email: string, name?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.split('@')[0].slice(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center mr-3">
                <Bot className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-black">Easy Eddy</span>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              type="button"
              className="text-gray-700 hover:text-brand-green px-3 py-2 text-sm font-medium cursor-pointer"
              onClick={() => window.location.href = '/dashboard'}
            >
              Dashboard
            </button>
            <button 
              type="button"
              className="text-gray-700 hover:text-brand-green px-3 py-2 text-sm font-medium cursor-pointer"
              onClick={() => {
                if (typeof window !== 'undefined' && window.location) {
                  window.location.href = "/subscription";
                }
              }}
            >
              Subscription
            </button>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="relative p-2 text-gray-400 hover:text-brand-green cursor-pointer"
                >
                  <Bell size={20} />
                  {unreadNotifications.length > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                    >
                      {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <Notifications userId={user.id} />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 text-gray-400 hover:text-brand-green cursor-pointer"
              onClick={function() {
                try {
                  setIsProfileOpen(true);
                } catch (error) {
                  console.error('Settings open error:', error);
                }
              }}
              title="Open profile settings"
              style={{ cursor: 'pointer' }}
            >
              <Settings size={20} />
            </Button>
            
            <div className="relative">
              <div 
                className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-green-dark transition-colors"
                onClick={function() {
                  try {
                    setIsProfileOpen(true);
                  } catch (error) {
                    console.error('Profile open error:', error);
                  }
                }}
                title="Click to open profile or sign out"
                style={{ cursor: 'pointer' }}
              >
                <span className="text-white text-sm font-medium">
                  {getInitials(user.email, user.fullName || undefined)}
                </span>
              </div>
              
              {/* Mini dropdown for sign out */}
              <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10 hidden group-hover:block">
                <button
                  onClick={function() {
                    try {
                      // Cross-browser storage cleanup
                      if (typeof localStorage !== 'undefined') {
                        localStorage.removeItem("easy_eddy_session_token");
                      }
                      if (typeof sessionStorage !== 'undefined') {
                        sessionStorage.removeItem("easy_eddy_user_id");
                      }
                    } catch (e) {
                      console.warn("Storage cleanup failed:", e);
                    }
                    
                    // Cross-browser navigation
                    if (typeof window !== 'undefined' && window.location) {
                      window.location.href = "/signin";
                    }
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  style={{ cursor: 'pointer' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          <ProfileToggle 
            user={user} 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
          />
        </div>
      </div>
    </header>
  );
}
