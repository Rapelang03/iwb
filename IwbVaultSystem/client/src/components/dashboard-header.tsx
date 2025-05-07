import { User, Bell, Menu, Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { User as UserType } from "@shared/schema";

interface DashboardHeaderProps {
  title: string;
  user: UserType | null;
  onMenuClick: () => void;
}

export default function DashboardHeader({ title, user, onMenuClick }: DashboardHeaderProps) {
  const { logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center lg:w-64">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="ml-2 text-xl font-semibold lg:ml-0">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Notification Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <div className="max-h-80 overflow-y-auto">
                {/* Notification items */}
                <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">New client query submitted</p>
                    <span className="text-xs text-muted-foreground">10m ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Sarah Smith has a question about your premium service package.</p>
                </div>
                
                <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">Monthly report ready</p>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">The June financial report is now available for review.</p>
                </div>
                
                <div className="p-3 hover:bg-muted rounded-md cursor-pointer">
                  <div className="flex justify-between items-start">
                    <p className="font-medium text-sm">System update completed</p>
                    <span className="text-xs text-muted-foreground">Yesterday</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">The system has been successfully updated to the latest version.</p>
                </div>
              </div>
              
              <DropdownMenuSeparator />
              <div className="p-2 text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View all notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white">
                  {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="flex flex-col items-start text-sm hidden md:flex">
                  <span>{user?.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.role === "sales" && "Sales Personnel"}
                    {user?.role === "finance" && "Finance Personnel"}
                    {user?.role === "developer" && "Developer"}
                    {user?.role === "investor" && "Investor"}
                    {user?.role === "iwc_partner" && "IWC Partner"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
