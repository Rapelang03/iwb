import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import DashboardSidebar from "@/components/dashboard-sidebar";
import DashboardHeader from "@/components/dashboard-header";
import FinancialChart from "@/components/financial-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, PlusCircle, ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";
import { IncomeStatement } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema for income statement form
const incomeStatementSchema = z.object({
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
  totalRevenue: z.string().min(1, "Total revenue is required"),
  totalExpenses: z.string().min(1, "Total expenses is required"),
});

type IncomeStatementFormValues = z.infer<typeof incomeStatementSchema>;

export default function Income() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Redirect if user is not authorized
  useEffect(() => {
    if (user && !["finance", "developer", "investor", "iwc_partner"].includes(user.role)) {
      window.location.href = "/";
    }
  }, [user]);

  // Form setup
  const form = useForm<IncomeStatementFormValues>({
    resolver: zodResolver(incomeStatementSchema),
    defaultValues: {
      month: "",
      year: new Date().getFullYear().toString(),
      totalRevenue: "",
      totalExpenses: "",
    },
  });

  // Fetch income statements
  const { data: incomeStatements, isLoading } = useQuery<IncomeStatement[]>({
    queryKey: ["/api/income"],
    enabled: !!user && ["finance", "developer", "investor", "iwc_partner"].includes(user.role),
  });

  // Create income statement mutation
  const createIncomeStatement = useMutation({
    mutationFn: async (data: {
      month: number;
      year: number;
      totalRevenue: number;
      totalExpenses: number;
      netProfit: number;
    }) => {
      const res = await apiRequest("POST", "/api/income", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/income"] });
      form.reset();
      setIsDialogOpen(false);
    },
  });

  // Handle form submission
  const onSubmit = (data: IncomeStatementFormValues) => {
    const month = parseInt(data.month);
    const year = parseInt(data.year);
    const totalRevenue = Math.round(parseFloat(data.totalRevenue) * 100); // Convert to cents
    const totalExpenses = Math.round(parseFloat(data.totalExpenses) * 100); // Convert to cents
    const netProfit = totalRevenue - totalExpenses;

    createIncomeStatement.mutate({
      month,
      year,
      totalRevenue,
      totalExpenses,
      netProfit,
    });
  };

  // Generate months for select
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Generate years for select (5 years back, current year, 2 years forward)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i).map(year => ({
    value: year.toString(),
    label: year.toString(),
  }));

  // Calculate total values
  const totalRevenue = incomeStatements?.reduce((sum, statement) => sum + statement.totalRevenue, 0) || 0;
  const totalExpenses = incomeStatements?.reduce((sum, statement) => sum + statement.totalExpenses, 0) || 0;
  const totalProfit = incomeStatements?.reduce((sum, statement) => sum + statement.netProfit, 0) || 0;

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
          title="Income Statements" 
          user={user} 
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-green-100">
                    <ArrowUpCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                    <h3 className="text-2xl font-bold">${(totalRevenue / 100).toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-red-100">
                    <ArrowDownCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                    <h3 className="text-2xl font-bold">${(totalExpenses / 100).toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="rounded-full p-3 bg-blue-100">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
                    <h3 className="text-2xl font-bold">${(totalProfit / 100).toLocaleString()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Financial Performance</CardTitle>
                  <CardDescription>Monthly revenue, expenses and profit</CardDescription>
                </div>
                
                {user && ["finance", "developer"].includes(user.role) && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Statement
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Income Statement</DialogTitle>
                      </DialogHeader>
                      
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="month"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Month</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select month" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {months.map(month => (
                                        <SelectItem key={month.value} value={month.value}>
                                          {month.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="year"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Year</FormLabel>
                                  <Select 
                                    onValueChange={field.onChange} 
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select year" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {years.map(year => (
                                        <SelectItem key={year.value} value={year.value}>
                                          {year.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <FormField
                            control={form.control}
                            name="totalRevenue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Revenue ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="totalExpenses"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Total Expenses ($)</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button 
                              type="submit" 
                              disabled={createIncomeStatement.isPending}
                            >
                              {createIncomeStatement.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>Save Statement</>
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <FinancialChart incomeStatements={incomeStatements || []} />
                )}
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Income Statement Data</CardTitle>
                <CardDescription>Monthly financial data</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex py-8 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : incomeStatements && incomeStatements.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left font-medium p-2">Period</th>
                          <th className="text-right font-medium p-2">Revenue</th>
                          <th className="text-right font-medium p-2">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Sort by newest date first */}
                        {[...incomeStatements]
                          .sort((a, b) => {
                            if (a.year !== b.year) return b.year - a.year;
                            return b.month - a.month;
                          })
                          .map((statement) => (
                            <tr key={statement.id} className="border-b hover:bg-muted/50">
                              <td className="p-2">
                                {months.find(m => parseInt(m.value) === statement.month)?.label}{' '}
                                {statement.year}
                              </td>
                              <td className="p-2 text-right">
                                ${(statement.totalRevenue / 100).toLocaleString()}
                              </td>
                              <td className={`p-2 text-right ${statement.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${(Math.abs(statement.netProfit) / 100).toLocaleString()}
                                {statement.netProfit < 0 && ' (Loss)'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No income statements found
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
