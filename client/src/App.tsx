
import { useState } from "react";
import { Router, Route, Switch } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";
import { queryClient } from "@/lib/queryClient";
import AdminConsole from "@/pages/admin-console";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/" nest>
          <AdminConsole />
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
