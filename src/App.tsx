import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Suspense, lazy, useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Loading from "./components/ui/loading";
import { ViewportProvider } from "./contexts/ViewportContext";

// Lazy load pages for better performance
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Diamonds = lazy(() => import("./pages/Diamonds"));
const DiamondDetail = lazy(() => import("./pages/DiamondDetail"));
const Clients = lazy(() => import("./pages/Clients"));
const ClientDetail = lazy(() => import("./pages/ClientDetail"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Invoices = lazy(() => import("./pages/Invoices"));
const InvoiceForm = lazy(() => import("./pages/InvoiceForm"));
const InvoiceDetail = lazy(() => import("./components/InvoiceDetail"));  // Added for invoice detail view
const CompanyDetailsManagement = lazy(() => import("./components/CompanyDetailsManagement"));  // Added for company settings
const NotFound = lazy(() => import("./pages/NotFound"));
const DiamondTestComponent = lazy(() => import("./components/DiamondTestComponent"));


// Existing components
const Settings = lazy(() => import("./components/Settings"));
const Help = lazy(() => import("./components/Help"));

// New Components
const SystemStatus = lazy(() => import("./components/SystemStatus"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper with loading state
const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <Loading />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
};

// Public route wrapper
const PublicRoute = () => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Suspense fallback={<Loading />}>
      <Outlet />
    </Suspense>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/diamonds" element={<Diamonds />} />
        <Route path="/diamonds/:id" element={<DiamondDetail />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/:id" element={<ClientDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        
        {/* Enhanced Invoice Routes */}
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/new" element={<InvoiceForm />} />
        <Route path="/invoices/:id" element={<InvoiceDetail />} />        
        <Route path="/invoices/:id/edit" element={<InvoiceForm />} />
        
        {/* Settings Routes */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/company" element={<CompanyDetailsManagement />} />  {/* Company settings */}
        <Route path="/settings/system" element={<SystemStatus />} />  {/* New System Status page */}
        
      </Route>
      
      <Route path="/help" element={<Help />} />
      
      <Route path="/test/diamonds" element={<DiamondTestComponent />} />

      {/* Error Routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// Add a responsive viewport meta tag programmatically
const ResponsiveMetaTag = () => {
  useEffect(() => {
    // Check if viewport meta tag already exists
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    
    // If not, create and append it
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta') as HTMLMetaElement;
      viewportMeta.name = 'viewport';
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewportMeta);
    }
  }, []);
  
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <ViewportProvider>
            <ResponsiveMetaTag />
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Suspense fallback={<Loading />}>
                  <AppRoutes />
                </Suspense>
              </BrowserRouter>
            </TooltipProvider>
          </ViewportProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;