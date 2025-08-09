
import { useState } from "react";
import { Router, Route, Switch, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { queryClient } from "@/lib/queryClient";
import AdminConsole from "@/pages/admin-console";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="h-4 bg-muted rounded w-48 mx-auto mb-2"></div>
          <div className="h-3 bg-muted rounded w-32 mx-auto"></div>
          <div className="text-sm text-muted-foreground mt-4">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Switch>
        <Route path="/login">
          {user ? <Redirect to="/" /> : <Login />}
        </Route>
        <Route path="/">
          {user ? <AdminConsole /> : <Redirect to="/login" />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AuthenticatedRouter />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
