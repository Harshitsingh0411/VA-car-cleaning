import React from 'react';
import SEO from '../components/seo/SEO';
import { ShieldCheck, FileText } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <SEO
        title="Terms & Conditions | VaCar Cleaning Service"
        description="Read the terms and conditions for booking our mobile car detailing services in Kanpur."
      />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-primary mb-6 shadow-sm">
            <FileText size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark mb-4">Terms & Conditions</h1>
          <p className="text-gray-500 font-semibold">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 prose prose-lg prose-indigo max-w-none text-gray-700
          prose-headings:font-heading prose-headings:font-bold prose-headings:text-dark
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100
          prose-p:leading-relaxed prose-p:mb-6
          prose-li:my-2
        ">

          <p className="lead text-xl text-gray-800 font-medium mb-8">
            Welcome to VaCar Cleaning Service. By booking our mobile detailing services, you agree to the following terms and conditions. Please read them carefully.
          </p>

          <h2>1. Service Agreements</h2>
          <p>
            By booking a service with VaCar, you authorize our crew to operate and clean your vehicle at the agreed-upon location. We require adequate space to perform our services safely. If the location is deemed unsafe or unsuitable by our crew, we reserve the right to reschedule or cancel the booking.
          </p>

          <h2>2. Payment & Pricing</h2>
          <p>
            All prices are subject to change based on the condition and size of the vehicle. Heavily soiled vehicles (e.g., excessive pet hair, mold, biohazards) may incur additional charges, which will be discussed and agreed upon before work begins. Payment is required upon completion of the service unless otherwise arranged.
          </p>

          <h2>3. Cancellations & Rescheduling</h2>
          <p>
            We require at least 24 hours' notice for cancellations or rescheduling. Failure to provide sufficient notice may result in a cancellation fee. VaCar reserves the right to cancel or reschedule appointments due to inclement weather, equipment failure, or staffing issues.
          </p>

          <h2>4. Liability and Damages</h2>
          <ul>
            <li><strong>Pre-existing Conditions:</strong> We are not responsible for pre-existing damage, including but not limited to scratches, dents, peeling paint, loose interior trim, or faulty electronics.</li>
            <li><strong>Personal Items:</strong> Please remove all personal belongings and valuables from your vehicle before our arrival. We are not liable for lost or damaged personal items.</li>
            <li><strong>Damage Claims:</strong> Any claims of damage caused by our services must be reported within 24 hours of service completion. We will thoroughly investigate any claims.</li>
          </ul>

          <h2>5. Satisfaction Guarantee</h2>
          <p>
            We strive for 100% customer satisfaction. If you are not satisfied with the service provided, please notify the crew immediately or contact our support team within 24 hours. We will make every effort to rectify the situation.
          </p>

          <h2>6. Privacy</h2>
          <p>
            We respect your privacy. Any personal information collected during booking will be used solely for service delivery and will not be shared with third parties without your consent. Please review our <a href="/privacy" className="text-primary font-bold hover:underline">Privacy Policy</a> for more details.
          </p>

          <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
            <h3 className="flex items-center gap-2 text-dark font-heading font-bold text-lg m-0 mb-2">
              <ShieldCheck className="text-primary" size={24} /> Contact Us
            </h3>
            <p className="m-0 text-gray-700 text-sm">
              If you have any questions or concerns regarding these terms, please contact us at <a href="mailto:vacarcleanservice3@gmail.com" className="text-primary font-bold hover:underline">vacarcleanservice3@gmail.com</a> or call us directly.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
