import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, ChevronRight } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { InsertUser } from "@shared/schema";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["sales", "finance", "developer", "investor", "iwc_partner"], {
    required_error: "Please select a role",
  }),
  termsAgreement: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
});

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, isLoading, login, logout, register } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Create form instances
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      termsAgreement: false,
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    login(data);
  };

  // Handle registration submission
  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    const { termsAgreement, ...userData } = data;
    register(userData as InsertUser);
  };

  // We already have redirection logic above

  return (
    <div className="min-h-screen flex md:flex-row flex-col animate-gradient bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 dark:from-indigo-950 dark:via-blue-900 dark:to-purple-950">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-pink-300 to-purple-400 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-blue-300 to-indigo-400 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full blur-3xl opacity-20"></div>
      
      {/* Left side - Authentication form */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 gradient-bg rounded-full">
              <TabsTrigger value="login" className="rounded-full data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-full data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-sm">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold gradient-text">IWB Enterprise Portal</CardTitle>
                  <CardDescription className="text-base">
                    Sign in to your account to access the dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input className="bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-white/10 backdrop-blur-md" placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input className="bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-white/10 backdrop-blur-md" type="password" placeholder="Enter your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="remember" />
                          <label
                            htmlFor="remember"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Remember me
                          </label>
                        </div>
                        
                        <Button variant="link" className="p-0 h-auto text-sm">
                          Forgot password?
                        </Button>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing in...
                          </>
                        ) : (
                          <>Sign in</>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("register")}>
                      Register now
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="glass-card border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-3xl font-bold gradient-text">Create an Account</CardTitle>
                  <CardDescription className="text-base">
                    Register to access IWB Enterprise Portal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input className="bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-white/10 backdrop-blur-md" placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input className="bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-white/10 backdrop-blur-md" type="email" placeholder="Enter your email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input className="bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-white/10 backdrop-blur-md" placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input className="bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-white/10 backdrop-blur-md" type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>User Role</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-white/30 dark:bg-gray-900/30 border-white/20 dark:border-white/10 backdrop-blur-md">
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sales">Sales Personnel</SelectItem>
                                <SelectItem value="finance">Finance Personnel</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                                <SelectItem value="investor">Investor</SelectItem>
                                <SelectItem value="iwc_partner">IWC Partner</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="termsAgreement"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>
                                I agree to the{" "}
                                <Button variant="link" className="p-0 h-auto">
                                  Terms and Conditions
                                </Button>
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white" 
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          <>Register</>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => setActiveTab("login")}>
                      Sign in
                    </Button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Right side - Hero Section */}
      <div className="md:w-1/2 w-full relative flex items-center justify-center p-12 overflow-hidden backdrop-blur-sm">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 animate-gradient"></div>
        
        {/* Glass overlay */}
        <div className="absolute inset-0 glass opacity-30"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-3xl opacity-10"></div>
        
        <div className="glass-panel max-w-md text-white relative z-10">
          <h1 className="text-5xl font-bold mb-6 text-white">
            <span className="inline-block">IWB</span>
            <span className="inline-block ml-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-100">Enterprise Portal</span>
          </h1>
          <p className="text-xl mb-8 text-blue-50">
            A comprehensive management system for your business needs
          </p>
          <ul className="space-y-5">
            <li className="flex items-start">
              <div className="glass p-2 rounded-full mr-3 flex-shrink-0">
                <ChevronRight className="h-5 w-5 text-blue-50" />
              </div>
              <span className="text-blue-50">Role-based access control for different team members</span>
            </li>
            <li className="flex items-start">
              <div className="glass p-2 rounded-full mr-3 flex-shrink-0">
                <ChevronRight className="h-5 w-5 text-blue-50" />
              </div>
              <span className="text-blue-50">Track products and services with detailed reporting</span>
            </li>
            <li className="flex items-start">
              <div className="glass p-2 rounded-full mr-3 flex-shrink-0">
                <ChevronRight className="h-5 w-5 text-blue-50" />
              </div>
              <span className="text-blue-50">Comprehensive financial performance dashboards</span>
            </li>
            <li className="flex items-start">
              <div className="glass p-2 rounded-full mr-3 flex-shrink-0">
                <ChevronRight className="h-5 w-5 text-blue-50" />
              </div>
              <span className="text-blue-50">Automated client query handling with intelligent response system</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
