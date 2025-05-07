import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import AppFooter from "@/components/app-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FolderClosed, FileText, Download, Eye, FileCode, Database, FileJson } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function Files() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("application");

  // Redirect if user is not authorized
  useEffect(() => {
    if (user && !["developer"].includes(user.role)) {
      window.location.href = "/";
    }
  }, [user]);

  // Define file type
  type FileItem = {
    id: number;
    name: string;
    type: "file" | "folder";
    size?: string;
    items?: number;
    lastModified: string;
  };

  // Mock file structure for demonstration
  const applicationFiles: FileItem[] = [
    { id: 1, name: "index.ts", type: "file", size: "12KB", lastModified: "2023-06-10" },
    { id: 2, name: "auth.ts", type: "file", size: "18KB", lastModified: "2023-06-12" },
    { id: 3, name: "routes.ts", type: "file", size: "24KB", lastModified: "2023-06-15" },
    { id: 4, name: "storage.ts", type: "file", size: "16KB", lastModified: "2023-06-14" },
    { id: 5, name: "components", type: "folder", items: 12, lastModified: "2023-06-08" },
    { id: 6, name: "pages", type: "folder", items: 8, lastModified: "2023-06-09" },
    { id: 7, name: "lib", type: "folder", items: 5, lastModified: "2023-06-11" },
  ];

  const databaseFiles: FileItem[] = [
    { id: 1, name: "schema.ts", type: "file", size: "8KB", lastModified: "2023-06-12" },
    { id: 2, name: "migrations", type: "folder", items: 6, lastModified: "2023-06-14" },
    { id: 3, name: "backup_20230615.sql", type: "file", size: "1.2MB", lastModified: "2023-06-15" },
    { id: 4, name: "backup_20230614.sql", type: "file", size: "1.1MB", lastModified: "2023-06-14" },
    { id: 5, name: "backup_20230613.sql", type: "file", size: "1.0MB", lastModified: "2023-06-13" },
  ];

  const configFiles: FileItem[] = [
    { id: 1, name: "tsconfig.json", type: "file", size: "2KB", lastModified: "2023-06-01" },
    { id: 2, name: "vite.config.ts", type: "file", size: "3KB", lastModified: "2023-06-01" },
    { id: 3, name: "package.json", type: "file", size: "4KB", lastModified: "2023-06-10" },
    { id: 4, name: "tailwind.config.ts", type: "file", size: "3KB", lastModified: "2023-06-05" },
    { id: 5, name: "drizzle.config.ts", type: "file", size: "1KB", lastModified: "2023-06-03" },
  ];

  // Get active files based on the tab
  const getActiveFiles = () => {
    switch (activeTab) {
      case "application":
        return applicationFiles;
      case "database":
        return databaseFiles;
      case "config":
        return configFiles;
      default:
        return applicationFiles;
    }
  };

  // Filter files based on search query
  const filteredFiles = getActiveFiles().filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DashboardSidebar 
          currentUser={user}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader 
            title="Application Files" 
            user={user} 
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mb-4">
              <Button
                onClick={() => window.location.href = "/"}
                className="text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                ← Back to Home
              </Button>
            </div>
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>File Management</CardTitle>
                    <CardDescription>
                      Manage application files and database
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search files..."
                        className="pl-8 w-full sm:w-[260px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    
                    <Button
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files && target.files.length > 0) {
                            const file = target.files[0];
                            alert(`Selected file: ${file.name}\nSize: ${Math.round(file.size / 1024)}KB\nType: ${file.type}\n\nFile would be uploaded here in a real application.`);
                          }
                        };
                        input.click();
                      }}
                    >
                      Upload File
                    </Button>
                  </div>
                </div>
                
                <Tabs 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  className="mt-4"
                >
                  <TabsList>
                    <TabsTrigger value="application">Application Files</TabsTrigger>
                    <TabsTrigger value="database">Database Files</TabsTrigger>
                    <TabsTrigger value="config">Configuration</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <Breadcrumb className="mt-4">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/files">Files</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </CardHeader>
              
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Name</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Type</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Size/Items</th>
                        <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Last Modified</th>
                        <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {file.type === "folder" ? (
                                <FolderClosed className="h-5 w-5 text-amber-500 mr-2" />
                              ) : (
                                activeTab === "config" ? (
                                  <FileJson className="h-5 w-5 text-blue-500 mr-2" />
                                ) : activeTab === "database" ? (
                                  <Database className="h-5 w-5 text-green-500 mr-2" />
                                ) : (
                                  <FileCode className="h-5 w-5 text-purple-500 mr-2" />
                                )
                              )}
                              <span className="font-medium">{file.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                            {file.type === "folder" ? "Directory" : "File"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                            {file.type === "folder" ? `${file.items} items` : file.size}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            {file.lastModified}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="View"
                                onClick={() => {
                                  if (file.type === "folder") {
                                    alert(`Opening folder: ${file.name}`);
                                  } else {
                                    alert(`Viewing file: ${file.name}`);
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {file.type !== "folder" && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  title="Download"
                                  onClick={() => {
                                    alert(`Downloading file: ${file.name}`);
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      
                      {filteredFiles.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No files found matching your search criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
      
      {/* Footer */}
      <AppFooter />
    </div>
  );
}