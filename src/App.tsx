/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Loader from "./components/ui/Loader";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Jobs from "./pages/Jobs";
import Book from "./pages/Book";
import Contact from "./pages/Contact";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import ProtectedRoute from "./components/ProtectedRoute";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import NotificationCenter from "./pages/NotificationCenter";

import ExteriorWash from "./pages/services/ExteriorWash";
import InteriorCleaning from "./pages/services/InteriorCleaning";
import FoamWash from "./pages/services/FoamWash";
import WaxPolish from "./pages/services/WaxPolish";
import DashboardCleaning from "./pages/services/DashboardCleaning";
import TyreDressing from "./pages/services/TyreDressing";

import PartTimeJob from "./pages/jobs/PartTimeJob";
import ApplyNow from "./pages/jobs/ApplyNow";
import Benefits from "./pages/jobs/Benefits";
import WorkWithUs from "./pages/jobs/WorkWithUs";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} {...({ key: location.pathname } as any)}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="about" element={<About />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="book" element={<Book />} />
          <Route path="contact" element={<Contact />} />
          
          {/* Specific Service Subpages */}
          <Route path="services/exterior-wash" element={<ExteriorWash />} />
          <Route path="services/interior-cleaning" element={<InteriorCleaning />} />
          <Route path="services/foam-wash" element={<FoamWash />} />
          <Route path="services/wax-polish" element={<WaxPolish />} />
          <Route path="services/dashboard-cleaning" element={<DashboardCleaning />} />
          <Route path="services/tyre-dressing" element={<TyreDressing />} />
          
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
        </Route>
      </Routes>
    </AnimatePresence>
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
