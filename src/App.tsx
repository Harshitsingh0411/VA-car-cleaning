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
import About from "./pages/About";
import Founders from "./pages/Founders";
import Developers from "./pages/Developers";
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
import BookingDetailsPage from "./pages/BookingDetailsPage";


import PartTimeJob from "./pages/jobs/PartTimeJob";
import ApplyNow from "./pages/jobs/ApplyNow";
import Benefits from "./pages/jobs/Benefits";
import WorkWithUs from "./pages/jobs/WorkWithUs";

import DynamicLandingPage from "./pages/seo/DynamicLandingPage";
import Locations from "./pages/Locations";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQs from "./pages/FAQs";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Routes location={location}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="pricing" element={<Services />} />
          <Route path="subscription" element={<Services />} />
          <Route path="subscription-plans" element={<Services />} />
          <Route path="locations" element={<Locations />} />
          <Route path="membership" element={<Services />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="reviews" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="about-us" element={<About />} />
          <Route path="founders" element={<Founders />} />
          <Route path="founders-details" element={<Founders />} />
          <Route path="about/founders" element={<Founders />} />
          <Route path="developers" element={<Developers />} />
          <Route path="software-developers" element={<Developers />} />
          <Route path="credits" element={<Developers />} />
          <Route path="about/developers" element={<Developers />} />
          <Route path="jobs" element={<Jobs />} />
          <Route 
            path="book" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <Book />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="book-now" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <Book />
              </ProtectedRoute>
            } 
          />
          <Route path="contact" element={<Contact />} />
          <Route path="terms" element={<TermsConditions />} />
          <Route path="terms-and-conditions" element={<TermsConditions />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="refund-policy" element={<TermsConditions />} />
          <Route path="faqs" element={<FAQs />} />
          <Route path="faq" element={<FAQs />} />
          <Route path="help-center" element={<FAQs />} />

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
            path="account/booking/:bookingId" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <BookingDetailsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="account/booking-details/:bookingId" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <BookingDetailsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="booking/:bookingId" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <BookingDetailsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="account/:section" 
            element={
              <ProtectedRoute allowedRoles={["admin", "staff", "customer"]}>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="admin/*" 
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

import ErrorBoundary from "./components/common/ErrorBoundary";
import { ImageLightboxProvider } from "./context/ImageLightboxContext";

// Updated at 2026-08-05 for Admin Dashboard HMR Refresh
export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ImageLightboxProvider>
      <AuthProvider>
        {isLoading && <Loader onComplete={() => setIsLoading(false)} />}
        {!isLoading && (
          <Router>
            <ErrorBoundary key={Date.now()}>
              <AnimatedRoutes />
            </ErrorBoundary>
          </Router>
        )}
      </AuthProvider>
    </ImageLightboxProvider>
  );
}
