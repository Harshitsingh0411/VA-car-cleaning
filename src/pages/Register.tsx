import React, { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserPlus, Chrome, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/Button";

export default function Register() {
  const { user, registerWithEmail, loginWithGoogle } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/account");
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerWithEmail(email, password, name);
      navigate("/account");
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMsg("");
    loginWithGoogle()
      .then(() => {
        navigate("/account");
      })
      .catch((err: any) => {
        setErrorMsg(err.message || "Google Authentication failed.");
      });
  };

  return (
    <div className="pt-24 min-h-screen bg-[#070C16] pb-24 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-20 left-[-10%] w-[35vw] h-[35vw] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6"
        >
          <div className="text-center space-y-2">
            <span className="text-[#F4B400] font-heading font-semibold tracking-widest text-xs uppercase block">— JOIN US —</span>
            <h1 className="text-3xl font-heading font-extrabold text-dark tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-xs">Sign up to schedule doorstep detailing appointments.</p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-xs font-semibold flex items-center gap-2"
            >
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="reg-name" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <User size={16} className="absolute left-3.5 top-[50%] -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="reg-email" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <Mail size={16} className="absolute left-3.5 top-[50%] -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-pass" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  id="reg-pass"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-[50%] -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="reg-confirm" className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <input
                  id="reg-confirm"
                  type="password"
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3.5 pl-10 pr-4 font-semibold text-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                />
                <Lock size={16} className="absolute left-3.5 top-[50%] -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-primary hover:bg-[#0b327b] text-white font-bold rounded-2xl transition-all duration-300 text-sm shadow flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Register
                  <UserPlus size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 text-xs text-gray-400 font-semibold my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span>OR</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-dark font-bold rounded-2xl transition-all duration-300 text-sm shadow flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Chrome size={18} className="text-rose-500 fill-rose-500" />
            Sign Up with Google
          </button>

          {/* Call to Login */}
          <div className="text-center pt-2 text-xs font-semibold text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-bold">
              Sign In here
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
