import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, UserPlus, ShieldAlert, Shield, UserCog, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function UserManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Redirect if user is not authorized
  useEffect(() => {
    if (user && !["developer"].includes(user.role)) {
      window.location.href = "/";
    }
  }, [user]);

  // Fetch users
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "developer",
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset MFA mutation
  const resetMfa = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/users/${userId}/reset-mfa`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsResetDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "MFA Reset Successful",
        description: "The user will need to set up MFA on their next login",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "MFA Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle reset MFA
  const handleResetMfa = () => {
    if (selectedUser) {
      resetMfa.mutate(selectedUser.id);
    }
  };

  // Get badge color for role
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "developer":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "sales":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "finance":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "investor":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "iwc_partner":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar 
        currentUser={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="User Management" 
          user={user} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>User Administration</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-8 w-full sm:w-[260px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account with specific role and permissions.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="name" className="text-right">
                            Full Name
                          </Label>
                          <Input id="name" className="col-span-3" placeholder="Enter full name" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="email" className="text-right">
                            Email
                          </Label>
                          <Input id="email" className="col-span-3" placeholder="Enter email address" type="email" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="username" className="text-right">
                            Username
                          </Label>
                          <Input id="username" className="col-span-3" placeholder="Choose username" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="password" className="text-right">
                            Password
                          </Label>
                          <Input id="password" className="col-span-3" type="password" placeholder="Set initial password" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="role" className="text-right">
                            Role
                          </Label>
                          <Select>
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="sales">Sales Personnel</SelectItem>
                              <SelectItem value="finance">Finance Personnel</SelectItem>
                              <SelectItem value="developer">Developer</SelectItem>
                              <SelectItem value="investor">Investor</SelectItem>
                              <SelectItem value="iwc_partner">IWC Partner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label className="text-right">MFA Required</Label>
                          <div className="col-span-3 flex items-center space-x-2">
                            <Switch id="mfa-required" defaultChecked />
                            <Label htmlFor="mfa-required">
                              Require multi-factor authentication
                            </Label>
                          </div>
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button>Create User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">User</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Role</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Email</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Created</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">MFA Status</th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredUsers.map((usr) => (
                        <tr key={usr.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary-700 flex items-center justify-center text-white mr-3">
                                {usr.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium">{usr.fullName}</div>
                                <div className="text-xs text-muted-foreground">@{usr.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge className={`${getRoleBadgeColor(usr.role)} font-medium`} variant="outline">
                              {usr.role === "sales" && "Sales"}
                              {usr.role === "finance" && "Finance"}
                              {usr.role === "developer" && "Developer"}
                              {usr.role === "investor" && "Investor"}
                              {usr.role === "iwc_partner" && "IWC Partner"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                            {usr.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            {new Date(usr.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {usr.mfaSecret ? (
                              <div className="flex items-center">
                                <Shield className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-700 text-sm">Enabled</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <ShieldAlert className="h-4 w-4 text-amber-500 mr-1" />
                                <span className="text-amber-700 text-sm">Not Setup</span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[160px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <UserCog className="h-4 w-4 mr-2" /> Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedUser(usr);
                                  setIsResetDialogOpen(true);
                                }}>
                                  <ShieldAlert className="h-4 w-4 mr-2" /> Reset MFA
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No users found matching your search criteria
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Reset MFA Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset MFA</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset multi-factor authentication for {selectedUser?.fullName}? 
              They will need to set up MFA again on their next login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetMfa}
              disabled={resetMfa.isPending}
            >
              {resetMfa.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>Reset MFA</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
