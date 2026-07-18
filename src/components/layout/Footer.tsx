import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Car, Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from "lucide-react";
import vaLogo from "@/assets/va logo.png";
import { seoServices, seoLocations } from "../../data/seoData";
import { getContactSettings, dbContactSettings, DEFAULT_CONTACT_SETTINGS } from "../../services/dbService";

export default function Footer() {
  const [contactSettings, setContactSettings] = useState<dbContactSettings>(DEFAULT_CONTACT_SETTINGS);

  useEffect(() => {
    getContactSettings().then(setContactSettings);
  }, []);
  return (
    <footer className="bg-[#0B1220] text-gray-400 py-16 border-t border-white/5 relative">
      <div className="container mx-auto px-4 md:px-6">

        {/* Foot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">

          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 flex items-center justify-center">
                <img src={vaLogo} alt="VA Detailing Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-base leading-none text-white tracking-tight">
                  VA
                </span>
                <span className="text-[8px] tracking-widest font-black text-[#F4B400]">
                  CAR CLEANING
                </span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-gray-400 max-w-[200px]">
              We provide premium car cleaning & detailing services at your doorstep. Your car, our responsibility.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {contactSettings.facebook && (
                <a href={contactSettings.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#F4B400] hover:text-dark transition-colors">
                  <Facebook size={16} />
                </a>
              )}
              {contactSettings.instagram && (
                <a href={contactSettings.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#F4B400] hover:text-dark transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {contactSettings.youtube && (
                <a href={contactSettings.youtube} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#F4B400] hover:text-dark transition-colors">
                  <Youtube size={16} />
                </a>
              )}
              {contactSettings.twitter && (
                <a href={contactSettings.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#F4B400] hover:text-dark transition-colors">
                  <Twitter size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-heading font-bold mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link to="/" className="hover:text-[#F4B400] transition-colors">Home</Link></li>
              <li><Link to="/services" className="hover:text-[#F4B400] transition-colors">Services</Link></li>
              <li><Link to="/pricing" className="hover:text-[#F4B400] transition-colors">Pricing</Link></li>
              <li><Link to="/gallery" className="hover:text-[#F4B400] transition-colors">Gallery</Link></li>
              <li><Link to="/about" className="hover:text-[#F4B400] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#F4B400] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-white font-heading font-bold mb-5 text-sm uppercase tracking-wider">Our Services</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              {seoServices.slice(0, 6).map(service => (
                <li key={service.slug}>
                  <Link to={`/services/${service.slug}`} className="hover:text-[#F4B400] transition-colors">
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Areas */}
          <div>
            <h4 className="text-white font-heading font-bold mb-5 text-sm uppercase tracking-wider">Popular Areas</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              {seoLocations.slice(0, 6).map(location => (
                <li key={location.slug}>
                  <Link to={`/kanpur/${location.slug}`} className="hover:text-[#F4B400] transition-colors">
                    {location.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Job Opportunity */}
          <div>
            <h4 className="text-white font-heading font-bold mb-5 text-sm uppercase tracking-wider">Job Opportunity</h4>
            <ul className="flex flex-col gap-2.5 text-xs">
              <li><Link to="/jobs/part-time" className="hover:text-[#F4B400] transition-colors">Part-Time Job</Link></li>
              <li><Link to="/jobs/apply" className="hover:text-[#F4B400] transition-colors">Apply Now</Link></li>
              <li><Link to="/jobs/benefits" className="hover:text-[#F4B400] transition-colors">Benefits</Link></li>
              <li><Link to="/jobs/work-with-us" className="hover:text-[#F4B400] transition-colors">Work With Us</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3.5 text-xs">
            <h4 className="text-white font-heading font-bold mb-5 text-sm uppercase tracking-wider">Contact Us</h4>
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="text-[#F4B400] mt-0.5 shrink-0" />
              <div className="flex flex-col gap-1">
                <span>{contactSettings.phone1}</span>
                <span>{contactSettings.phone2}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-[#F4B400] shrink-0" />
              <span>{contactSettings.email}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="text-[#F4B400] mt-0.5 shrink-0" />
              <span className="leading-relaxed">{contactSettings.address}</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} VA Car Cleaning Service. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
