import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import QueryForm from "@/components/query-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Search, CheckCircle, MessageSquareText } from "lucide-react";
import { ClientQuery, InsertClientQuery } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Queries() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuery, setSelectedQuery] = useState<ClientQuery | null>(null);
  const [responseText, setResponseText] = useState("");

  // Redirect if user is not authorized
  useEffect(() => {
    if (user && !["sales", "developer"].includes(user.role)) {
      window.location.href = "/";
    }
  }, [user]);

  // Fetch client queries
  const { data: queries, isLoading } = useQuery<ClientQuery[]>({
    queryKey: ["/api/queries"],
    enabled: !!user && ["sales", "developer"].includes(user.role),
  });

  // Create query mutation
  const createQuery = useMutation({
    mutationFn: async (data: InsertClientQuery) => {
      const res = await apiRequest("POST", "/api/queries", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queries"] });
    },
  });

  // Respond to query mutation
  const respondToQuery = useMutation({
    mutationFn: async ({ id, response }: { id: number, response: string }) => {
      const res = await apiRequest("POST", `/api/queries/${id}/respond`, { response });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queries"] });
      setSelectedQuery(null);
      setResponseText("");
    },
  });

  // Filter queries based on search query and active tab
  const filteredQueries = queries?.filter(query => {
    const matchesSearch = 
      query.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      query.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      query.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "pending") {
      return matchesSearch && query.status === "pending";
    } else if (activeTab === "completed") {
      return matchesSearch && (query.status === "complete" || query.status === "auto_complete");
    }
    
    return matchesSearch;
  });

  // Handler for submitting a new query
  const handleSubmitQuery = (data: InsertClientQuery) => {
    createQuery.mutate(data);
  };

  // Handler for submitting a response
  const handleSubmitResponse = () => {
    if (selectedQuery && responseText.trim()) {
      respondToQuery.mutate({
        id: selectedQuery.id,
        response: responseText
      });
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
          title="Client Queries" 
          user={user} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queries List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <CardTitle>Client Queries</CardTitle>
                      <CardDescription>
                        Manage client queries and responses
                      </CardDescription>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search queries..."
                          className="pl-8 w-full sm:w-[200px] md:w-[260px]"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Query
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle>Create New Client Query</DialogTitle>
                          </DialogHeader>
                          <QueryForm 
                            onSubmit={handleSubmitQuery}
                            isSubmitting={createQuery.isPending}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab}
                    className="mt-4"
                  >
                    <TabsList>
                      <TabsTrigger value="all">All Queries</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : filteredQueries && filteredQueries.length > 0 ? (
                    <div className="relative overflow-x-auto rounded-md border">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted/50">
                          <tr>
                            <th className="px-4 py-3">Client</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredQueries.map((query) => (
                            <tr key={query.id} className="border-t hover:bg-muted/50">
                              <td className="px-4 py-3">
                                <div>
                                  <div className="font-medium">{query.clientName}</div>
                                  <div className="text-xs text-muted-foreground">{query.clientEmail}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {new Date(query.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <Badge variant={
                                  query.status === "pending" ? "outline" :
                                  query.status === "auto_complete" ? "secondary" : "default"
                                }>
                                  {query.status === "pending" ? "Pending" :
                                   query.status === "auto_complete" ? "Auto-Completed" : "Completed"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedQuery(query)}
                                >
                                  {query.status === "pending" ? "Respond" : "View"}
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No client queries found
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Query Details Panel */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Query Details</CardTitle>
                  <CardDescription>
                    {selectedQuery 
                      ? `From ${selectedQuery.clientName}` 
                      : "Select a query to view details"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedQuery ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Client Information</h3>
                        <p className="text-sm">
                          <span className="font-semibold">Name:</span> {selectedQuery.clientName}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Email:</span> {selectedQuery.clientEmail}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Date:</span> {new Date(selectedQuery.createdAt).toLocaleString()}
                        </p>
                        <p className="text-sm">
                          <span className="font-semibold">Status:</span>{' '}
                          <Badge variant={
                            selectedQuery.status === "pending" ? "outline" :
                            selectedQuery.status === "auto_complete" ? "secondary" : "default"
                          }>
                            {selectedQuery.status === "pending" ? "Pending" :
                             selectedQuery.status === "auto_complete" ? "Auto-Completed" : "Completed"}
                          </Badge>
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Message</h3>
                        <div className="bg-muted/30 p-3 rounded-md text-sm">
                          {selectedQuery.message}
                        </div>
                      </div>
                      
                      {selectedQuery.response && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Response</h3>
                          <div className="bg-primary/10 p-3 rounded-md text-sm">
                            {selectedQuery.response}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {selectedQuery.status === "auto_complete" 
                              ? "Automatically generated response" 
                              : "Manually provided response"}
                          </p>
                        </div>
                      )}
                      
                      {selectedQuery.status === "pending" && (
                        <div>
                          <h3 className="text-sm font-medium mb-2">Your Response</h3>
                          <Textarea
                            placeholder="Type your response here..."
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            rows={4}
                          />
                          <Button 
                            className="mt-4 w-full"
                            onClick={handleSubmitResponse}
                            disabled={!responseText.trim() || respondToQuery.isPending}
                          >
                            {respondToQuery.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Send Response
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <MessageSquareText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">No query selected</p>
                      <p className="text-xs text-muted-foreground">
                        Select a query from the list to view details
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
