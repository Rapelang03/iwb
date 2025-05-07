import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, Store, MessageSquare, LineChart, Code, Database, 
  User, Users, Settings, LogOut, ChevronDown, X, Menu, 
  FileCode, DollarSign, UserCog, Share
} from "lucide-react";
import { User as UserType } from "@shared/schema";

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  onLinkClick?: () => void;
}

function NavItem({ 
  href, 
  icon, 
  title, 
  isActive, 
  isCollapsed, 
  onLinkClick 
}: NavItemProps) {
  return (
    <Link href={href}>
      <div
        onClick={onLinkClick}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
          isActive 
            ? "bg-primary/10 text-primary font-medium border-l-4 border-primary" 
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        {icon}
        {!isCollapsed && <span>{title}</span>}
      </div>
    </Link>
  );
}

interface SidebarProps {
  currentUser: UserType | null;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function DashboardSidebar({ 
  currentUser, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}: SidebarProps) {
  const [location] = useLocation();
  const { logout, isLoading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    logout();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col gap-2">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {!isCollapsed && (
            <span className="text-lg font-semibold">IWB Enterprise Portal</span>
          )}
          {isCollapsed && (
            <span className="text-lg font-semibold">IWB</span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <ScrollArea className="flex-1 px-2">
        <div className="flex flex-col gap-1 py-2">
          {/* User Info */}
          <div className="mb-4 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                {currentUser?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
              {!isCollapsed && (
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser?.fullName}</p>
                  <p className="text-xs leading-none text-sidebar-foreground/60">
                    {currentUser?.role === "sales" && "Sales Personnel"}
                    {currentUser?.role === "finance" && "Finance Personnel"}
                    {currentUser?.role === "developer" && "Developer"}
                    {currentUser?.role === "investor" && "Investor"}
                    {currentUser?.role === "iwc_partner" && "IWC Partner"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dashboard link (for everyone) */}
          <NavItem
            href="/"
            icon={<LayoutDashboard className="h-4 w-4" />}
            title="Dashboard"
            isActive={location === "/"}
            isCollapsed={isCollapsed}
            onLinkClick={() => setMobileMenuOpen(false)}
          />

          {/* Sales Personnel Navigation */}
          {currentUser && ["sales", "developer", "iwc_partner"].includes(currentUser.role) && (
            <>
              <h3 className={cn(
                "px-4 py-2 text-xs font-medium uppercase text-sidebar-foreground/60",
                isCollapsed && "sr-only"
              )}>
                Products & Sales
              </h3>
              <NavItem
                href="/products"
                icon={<Store className="h-4 w-4" />}
                title="Products & Services"
                isActive={location === "/products"}
                isCollapsed={isCollapsed}
                onLinkClick={() => setMobileMenuOpen(false)}
              />
            </>
          )}

          {/* Client Queries (for sales personnel) */}
          {currentUser && ["sales", "developer"].includes(currentUser.role) && (
            <NavItem
              href="/queries"
              icon={<MessageSquare className="h-4 w-4" />}
              title="Client Queries"
              isActive={location === "/queries"}
              isCollapsed={isCollapsed}
              onLinkClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Finance Navigation */}
          {currentUser && ["finance", "developer", "investor", "iwc_partner"].includes(currentUser.role) && (
            <>
              <h3 className={cn(
                "px-4 py-2 text-xs font-medium uppercase text-sidebar-foreground/60",
                isCollapsed && "sr-only"
              )}>
                Finance
              </h3>
              <NavItem
                href="/income"
                icon={<LineChart className="h-4 w-4" />}
                title="Income Statements"
                isActive={location === "/income"}
                isCollapsed={isCollapsed}
                onLinkClick={() => setMobileMenuOpen(false)}
              />
            </>
          )}

          {/* Developer Navigation */}
          {currentUser && ["developer"].includes(currentUser.role) && (
            <>
              <h3 className={cn(
                "px-4 py-2 text-xs font-medium uppercase text-sidebar-foreground/60",
                isCollapsed && "sr-only"
              )}>
                Development
              </h3>
              <NavItem
                href="/files"
                icon={<FileCode className="h-4 w-4" />}
                title="Application Files"
                isActive={location === "/files"}
                isCollapsed={isCollapsed}
                onLinkClick={() => setMobileMenuOpen(false)}
              />
              <NavItem
                href="/users"
                icon={<Users className="h-4 w-4" />}
                title="User Management"
                isActive={location === "/users"}
                isCollapsed={isCollapsed}
                onLinkClick={() => setMobileMenuOpen(false)}
              />
            </>
          )}

          {/* IWC Partner Links */}
          {currentUser && ["iwc_partner"].includes(currentUser.role) && (
            <>
              <h3 className={cn(
                "px-4 py-2 text-xs font-medium uppercase text-sidebar-foreground/60",
                isCollapsed && "sr-only"
              )}>
                Partner Access
              </h3>
              <NavItem
                href="/partner"
                icon={<Share className="h-4 w-4" />}
                title="Partnership Data"
                isActive={location === "/partner"}
                isCollapsed={isCollapsed}
                onLinkClick={() => setMobileMenuOpen(false)}
              />
            </>
          )}
        </div>
      </ScrollArea>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          disabled={isLoading}
        >
          {isLoading ? (
            <>Logging out...</>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" />
              {!isCollapsed && "Log Out"}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden lg:block bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-64"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 bg-sidebar w-[280px]">
          {sidebarContent}
        </SheetContent>
      </Sheet>
    </>
  );
}
