import React, { useState } from "react";
import { motion } from "motion/react";
import { CalendarCheck, DollarSign, Clock, ArrowRight, TrendingUp, HandCoins, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";

export default function PartTimeJob() {
  const [hoursPerWeek, setHoursPerWeek] = useState(20); // default 20 hours/week

  // Calculate monthly earnings metrics
  const hourlyRate = 120; // Rs 120 per hour base
  const baseSalary = hoursPerWeek * hourlyRate * 4.2; // approx 4.2 weeks per month
  const incentives = Math.round(baseSalary * 0.15); // 15% detailing incentive
  const fuelAllowance = hoursPerWeek * 15 * 4.2; // Rs 15 per hour travel
  const totalIncome = Math.round(baseSalary + incentives + fuelAllowance);

  return (
    <div className="pt-24 min-h-screen bg-[#F8FAFC] pb-24 relative overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[35vw] h-[35vw] bg-[#F4B400]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-5xl">
        {/* Breadcrumb */}
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/jobs" className="hover:text-primary transition-colors">Careers</Link>
          <span className="mx-2">/</span>
          <span className="text-primary">Part-Time Job</span>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT: Copy & Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold text-xs uppercase tracking-widest block">— EARN EXTRA INCOME —</span>
              <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-dark tracking-tight">Part-Time Job</h1>
              <p className="text-gray-600 text-base leading-relaxed">
                Looking for a flexible way to support your studies or earn extra monthly income? Join the VA doorstep wash network as a detailing partner. Work only 5-6 hours a day around your existing schedule.
              </p>
            </div>

            {/* Checklist advantages */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-heading font-extrabold text-dark">Job Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-gray-600">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F4B400]/10 text-dark flex items-center justify-center font-bold">⏰</div>
                  <span>5-6 Hours Flexible Shift</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F4B400]/10 text-dark flex items-center justify-center font-bold">💰</div>
                  <span>Performance Incentives</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F4B400]/10 text-dark flex items-center justify-center font-bold">🏍️</div>
                  <span>Fuel & Travel Allowances</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F4B400]/10 text-dark flex items-center justify-center font-bold">🎓</div>
                  <span>Students/Freelancers Welcome</span>
                </div>
              </div>
            </div>

            <Link to="/jobs/apply" className="inline-block pt-2">
              <Button className="bg-[#F4B400] hover:bg-[#ffe258] text-dark font-bold px-8 py-3.5 h-auto text-xs uppercase tracking-wider rounded-xl border-none shadow-lg">
                Apply For Slot Now <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          {/* RIGHT: Salary Calculator */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-lg font-heading font-extrabold text-dark flex items-center gap-2">
              <HandCoins size={18} className="text-primary" />
              Interactive Earnings Calculator
            </h3>

            <div className="bg-[#0B1220] border border-white/5 rounded-3xl p-6 text-white space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] bg-[size:16px_16px]" />

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase">
                  <span>Weekly Commitment</span>
                  <span className="text-[#F4B400]">{hoursPerWeek} Hours / Week</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="40"
                  step="5"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#F4B400]"
                />

                <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
                  <span>10 hours</span>
                  <span>25 hours</span>
                  <span>40 hours</span>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="space-y-3 pt-4 border-t border-white/5 text-xs text-gray-400 relative z-10">
                <div className="flex justify-between">
                  <span>Base Monthly Salary:</span>
                  <span className="font-semibold text-white">₹{Math.round(baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel/Travel Allowance:</span>
                  <span className="font-semibold text-white">₹{Math.round(fuelAllowance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Detox Skill Incentive (15%):</span>
                  <span className="font-semibold text-white">₹{incentives}</span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between pt-3 border-t border-white/10 text-sm font-bold text-[#F4B400]">
                  <span>Total Est. Monthly Income:</span>
                  <span className="text-lg font-heading font-black">₹{totalIncome}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-xs text-gray-500 leading-relaxed">
              <strong>💡 Detailer Tip:</strong> These calculations are based on an average hourly dispatcher load of 20 hours per week. Full-time master detailers earn higher base commissions!
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
