import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import StatusCard from "@/components/status-card";
import FinancialChart from "@/components/financial-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, HeadphonesIcon, MessageSquareText, Users } from "lucide-react";
import { ProductOrService, Sale, ClientQuery, IncomeStatement } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch data based on user role
  const { data: products, isLoading: productsLoading } = useQuery<ProductOrService[]>({
    queryKey: ["/api/products"],
    enabled: !!user && ["sales", "developer", "iwc_partner"].includes(user.role),
  });

  const { data: sales, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ["/api/sales"],
    enabled: !!user && ["sales", "finance", "developer", "iwc_partner"].includes(user.role),
  });

  const { data: queries, isLoading: queriesLoading } = useQuery<ClientQuery[]>({
    queryKey: ["/api/queries"],
    enabled: !!user && ["sales", "developer"].includes(user.role),
  });

  const { data: incomeStatements, isLoading: incomeLoading } = useQuery<IncomeStatement[]>({
    queryKey: ["/api/income"],
    enabled: !!user && ["finance", "developer", "investor", "iwc_partner"].includes(user.role),
  });

  // Calculate dashboard metrics
  const totalProducts = products?.filter(p => p.category === "product").length || 0;
  const totalServices = products?.filter(p => p.category === "service").length || 0;
  const totalQueries = queries?.length || 0;
  const pendingQueries = queries?.filter(q => q.status === "pending").length || 0;
  
  // Calculate total revenue for current month (simplified for demo)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const currentMonthIncome = incomeStatements?.find(
    s => s.month === currentMonth && s.year === currentYear
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        currentUser={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          title="Dashboard" 
          user={user} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Dashboard Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatusCard 
              title="Total Products"
              value={totalProducts.toString()}
              icon={<ShoppingCart className="h-5 w-5" />}
              iconColor="blue"
              isLoading={productsLoading}
            />
            
            <StatusCard 
              title="Total Services"
              value={totalServices.toString()}
              icon={<HeadphonesIcon className="h-5 w-5" />}
              iconColor="green"
              isLoading={productsLoading}
            />
            
            <StatusCard 
              title="Client Queries"
              value={`${pendingQueries} / ${totalQueries}`}
              icon={<MessageSquareText className="h-5 w-5" />}
              iconColor="purple"
              isLoading={queriesLoading}
            />
            
            <StatusCard 
              title="Monthly Revenue"
              value={currentMonthIncome 
                ? `$${(currentMonthIncome.totalRevenue / 100).toLocaleString()}`
                : "N/A"
              }
              icon={<Users className="h-5 w-5" />}
              iconColor="amber"
              isLoading={incomeLoading}
            />
          </div>

          {/* Role-specific Dashboard Components */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area (first 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Sales & Finance - Income Chart */}
              {user && ["sales", "finance", "developer", "investor", "iwc_partner"].includes(user.role) && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="gradient-text">Financial Performance</CardTitle>
                    <CardDescription>
                      Monthly overview of revenue, expenses, and profit
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {incomeLoading ? (
                      <div className="flex h-full items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <FinancialChart incomeStatements={incomeStatements || []} />
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Sales & Developer - Recent data */}
              {user && ["sales", "developer", "iwc_partner"].includes(user.role) && (
                <Card className="glass-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="gradient-text">Recent Activities</CardTitle>
                    <CardDescription>
                      Latest sales and client interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="sales">
                      <TabsList className="mb-4">
                        <TabsTrigger value="sales">Recent Sales</TabsTrigger>
                        {["sales", "developer"].includes(user.role) && (
                          <TabsTrigger value="queries">Client Queries</TabsTrigger>
                        )}
                      </TabsList>
                      
                      <TabsContent value="sales" className="space-y-4">
                        {salesLoading ? (
                          <div className="flex py-8 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          </div>
                        ) : sales && sales.length > 0 ? (
                          <div className="rounded-md border">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="bg-muted/50">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product/Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {/* Display only 5 most recent sales */}
                                  {[...sales]
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 5)
                                    .map((sale) => (
                                    <tr key={sale.id} className="hover:bg-muted/50">
                                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {products?.find(p => p.id === sale.productId)?.name || 'Unknown Product'}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        {new Date(sale.date).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        ${(sale.totalAmount / 100).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No sales records found
                          </div>
                        )}
                        <div className="flex justify-end">
                          <Button variant="outline" className="hover:gradient-text">View All Sales</Button>
                        </div>
                      </TabsContent>
                      
                      {["sales", "developer"].includes(user.role) && (
                        <TabsContent value="queries" className="space-y-4">
                          {queriesLoading ? (
                            <div className="flex py-8 items-center justify-center">
                              <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                          ) : queries && queries.length > 0 ? (
                            <div className="rounded-md border">
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead>
                                    <tr className="bg-muted/50">
                                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y">
                                    {/* Display only 5 most recent queries */}
                                    {[...queries]
                                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                      .slice(0, 5)
                                      .map((query) => (
                                      <tr key={query.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                          {query.clientName}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                          {new Date(query.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                                          <Badge variant={
                                            query.status === "pending" ? "outline" :
                                            query.status === "auto_complete" ? "secondary" : "default"
                                          }>
                                            {query.status === "pending" ? "Pending" :
                                             query.status === "auto_complete" ? "Auto-Completed" : "Completed"}
                                          </Badge>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              No client queries found
                            </div>
                          )}
                          <div className="flex justify-end">
                            <Button variant="outline" className="hover:gradient-text">View All Queries</Button>
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Sidebar (3rd column) */}
            <div className="space-y-6">
              {/* System Status Card */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="gradient-text">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Database</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">API Services</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Backup System</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Authentication</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600 hover:bg-green-50">
                      Operational
                    </Badge>
                  </div>
                  <div className="border-t pt-2 mt-2 text-xs text-muted-foreground">
                    Last updated: {new Date().toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              {/* Client Query Form (for sales personnel) */}
              {user && ["sales", "developer"].includes(user.role) && (
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="gradient-text">Client Query</CardTitle>
                    <CardDescription>Submit a new client query</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="client-name">
                          Client Name
                        </label>
                        <input
                          id="client-name"
                          className="w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Enter client name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="client-email">
                          Client Email
                        </label>
                        <input
                          id="client-email"
                          type="email"
                          className="w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Enter client email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="query-message">
                          Message
                        </label>
                        <textarea
                          id="query-message"
                          className="w-full rounded-md border border-input bg-background/50 backdrop-blur-sm px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          rows={3}
                          placeholder="Enter query details"
                        ></textarea>
                      </div>
                      <Button className="w-full gradient-button">Submit Query</Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
