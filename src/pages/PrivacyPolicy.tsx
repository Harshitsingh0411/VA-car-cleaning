import React from 'react';
import SEO from '../components/seo/SEO';
import { ShieldCheck, Lock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <SEO
        title="Privacy Policy | VaCar Cleaning Service"
        description="Learn how VaCar protects your data and privacy when booking our car detailing services."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-primary mb-6 shadow-sm">
            <Lock size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark mb-4">Privacy Policy</h1>
          <p className="text-gray-500 font-semibold">Effective Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 prose prose-lg prose-indigo max-w-none text-gray-700
          prose-headings:font-heading prose-headings:font-bold prose-headings:text-dark
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
          prose-p:leading-relaxed prose-p:mb-6
          prose-li:my-2
        ">

          <p className="lead text-xl text-gray-800 font-medium mb-8">
            At VaCar Cleaning Service, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.
          </p>

          <h2>1. Information We Collect</h2>
          <p>We may collect personal information that you voluntarily provide to us when booking a service or contacting us. This includes:</p>
          <ul>
            <li><strong>Contact Data:</strong> Name, email address, phone number, and physical address for service delivery.</li>
            <li><strong>Vehicle Data:</strong> Make, model, year, and license plate number of your vehicle.</li>
            <li><strong>Payment Data:</strong> Payment details are processed securely by our third-party payment processors. We do not store your full credit card information.</li>
            <li><strong>Communication Data:</strong> Records of your emails, messages, and calls with our customer support and detailing crew.</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our detailing services.</li>
            <li>Process transactions and send related information, including booking confirmations and invoices.</li>
            <li>Manage your account and communicate with you about your bookings.</li>
            <li>Assign and dispatch our detailing crew to your location safely.</li>
            <li>Send you promotional emails, newsletters, and marketing materials (you can opt out at any time).</li>
          </ul>

          <h2>3. Data Sharing and Disclosure</h2>
          <p>
            We do not sell, trade, or rent your personal identification information to others. We may share generic aggregated demographic information not linked to any personal identification information with our business partners and advertisers.
            <br /><br />
            <strong>Crew Dispatch:</strong> To provide our mobile service, your name, address, and contact number are shared with your assigned detailer so they can navigate to your location and contact you upon arrival.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. Your personal data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems and are required to keep the information confidential.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data stored with us. You can update your profile information directly from your Account Dashboard or contact us for assistance.
          </p>

          <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h3 className="flex items-center gap-2 text-dark font-heading font-bold text-lg m-0 mb-2">
              <ShieldCheck className="text-primary" size={24} /> Contact Us
            </h3>
            <p className="m-0 text-gray-700 text-sm">
              If you have any questions or concerns about this Privacy Policy, please contact us at <a href="mailto:vacarcleanservice3@gmail.com" className="text-primary font-bold hover:underline">vacarcleanservice3@gmail.com</a>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
