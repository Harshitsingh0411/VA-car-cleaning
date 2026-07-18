/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Loader from "./components/ui/Loader";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Jobs from "./pages/Jobs";
import Book from "./pages/Book";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeDashboard from "./pages/crew/EmployeeDashboard";
import NotificationCenter from "./pages/NotificationCenter";

import ExteriorWash from "./pages/services/ExteriorWash";
import ServiceDetailPage from "./pages/ServiceDetail";
import InteriorCleaning from "./pages/services/InteriorCleaning";
import FoamWash from "./pages/services/FoamWash";
import WaxPolish from "./pages/services/WaxPolish";
import DashboardCleaning from "./pages/services/DashboardCleaning";
import TyreDressing from "./pages/services/TyreDressing";

import PartTimeJob from "./pages/jobs/PartTimeJob";
import ApplyNow from "./pages/jobs/ApplyNow";
import Benefits from "./pages/jobs/Benefits";
import WorkWithUs from "./pages/jobs/WorkWithUs";

import DynamicLandingPage from "./pages/seo/DynamicLandingPage";
import BlogIndex from "./pages/blog/BlogIndex";
import BlogPost from "./pages/blog/BlogPost";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="book" element={<Book />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Blog Routes */}
          <Route path="blog" element={<BlogIndex />} />
          <Route path="blog/:slug" element={<BlogPost />} />

          {/* Dynamic SEO Routes for Content Scaling */}
          <Route path="services/:serviceSlug" element={<DynamicLandingPage type="service" />} />
          <Route path="kanpur/:locationSlug" element={<DynamicLandingPage type="location" />} />
          <Route path="services/:serviceSlug/kanpur/:locationSlug" element={<DynamicLandingPage type="combined" />} />

          {/* Specific Jobs/Careers Subpages */}
          <Route path="jobs/part-time" element={<PartTimeJob />} />
          <Route path="jobs/apply" element={<ApplyNow />} />
          <Route path="jobs/benefits" element={<Benefits />} />
          <Route path="jobs/work-with-us" element={<WorkWithUs />} />

          {/* Authentication & User Account Dashboard */}
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route 
            path="account" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff"]}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="employee" 
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="notifications" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <NotificationCenter />
              </ProtectedRoute>
            } 
          />
          {/* Fallback Catch-all for Dynamic SEO Location Routes */}
          {/* Note: This must be placed after all defined routes but before 404/NotFound if one exists */}
          <Route path=":slug" element={<DynamicLandingPage />} />
        </Route>
      </Routes>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AuthProvider>
      {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
      {!isLoading && (
        <Router>
          <AnimatedRoutes />
        </Router>
      )}
    </AuthProvider>
  );
}
