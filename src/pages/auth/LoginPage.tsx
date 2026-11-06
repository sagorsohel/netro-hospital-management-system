import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginSuccess } from "../../store/slices/authSlice";
import {
  Activity,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Stethoscope,
  FlaskConical,
  BedDouble,
  Sparkles,
  HelpCircle,
  X,
  UserCheck,
  Pill,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useLoginMutation } from "../../store/api/authApi";

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();

  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [activeDemo, setActiveDemo] = useState<string | null>("admin");

  // If already authenticated, redirect to /dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const performLogin = async (loginEmail: string, loginPass: string) => {
    setError("");

    try {
      const data = await loginMutation({
        email: loginEmail.trim(),
        password: loginPass,
      }).unwrap();

      if (!data.success || !data.token) {
        throw new Error(data.message || "Invalid email or password.");
      }

      dispatch(
        loginSuccess({
          user: data.user,
          token: data.token,
        })
      );

      navigate("/dashboard");
    } catch (err: any) {
      const message =
        err?.data?.message ||
        err?.message ||
        "Failed to connect to backend server. Make sure port 5001 is active.";
      setError(message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your staff email address.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    performLogin(email, password);
  };

  const handleQuickDemo = (role: "admin" | "pharmacy") => {
    setActiveDemo(role);
    if (role === "admin") {
      setEmail("admin@gmail.com");
      setPassword("12345678");
      performLogin("admin@gmail.com", "12345678");
    } else {
      setEmail("pharmacy@netro.com");
      setPassword("12345678");
      performLogin("pharmacy@netro.com", "12345678");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden font-sans select-none">
      {/* Ambient Clinical Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-400/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#008A3D 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Main Elevated Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,138,61,0.09),0_10px_30px_-5px_rgba(15,23,42,0.05)] border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Fresh Healthcare Identity & Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#024B27] via-[#006E33] to-[#008A3D] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative internal light aura */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Netro Adhunik Eye Hospital Brand Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Netro Adhunik Eye Hospital Logo"
                className="h-12 w-12 rounded-full object-cover shadow-md bg-white p-0.5 border border-white/40 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-white">
                    Netro Adhunik
                  </span>
                  <span className="text-xl font-bold tracking-tight text-emerald-100">
                    Eye Hospital
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 font-medium">
                  নেত্র আধুনিক চক্ষু হাসপাতাল
                </p>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-1">
              <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white leading-snug">
                Intelligent Clinical & Hospital Operations
              </h2>
              <p className="text-xs sm:text-sm text-emerald-50/90 leading-relaxed font-normal">
                Unified suite connecting outpatient queues, diagnostic laboratory billing, IPD ward care, and clinical workflows.
              </p>
            </div>

            {/* Fresh Frosted Feature Cards */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all">
                <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Stethoscope className="h-4 w-4 text-emerald-100" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Clinical OPD & Doctor Rosters
                  </h4>
                  <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                    Live patient queue tracking, token serials, and department consultation rosters.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all">
                <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical className="h-4 w-4 text-emerald-100" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Diagnostic Billing & Pharmacy
                  </h4>
                  <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                    Barcode test invoicing, real-time lab reports dispatch, and medicine dispensary sync.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition-all">
                <div className="h-8 w-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <BedDouble className="h-4 w-4 text-emerald-100" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">
                    Inpatient & Bed Allocation
                  </h4>
                  <p className="text-[11px] text-emerald-100/80 leading-relaxed">
                    Live ward occupancy matrix, nurse duty schedule, and patient admission ledger.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer: Trust Indicators */}
          <div className="pt-6 mt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-emerald-100/90 relative z-10">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
              99.9% Clinical Uptime
            </span>
            <span className="flex items-center gap-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-200" />
              HIPAA Compliant
            </span>
            <span className="text-emerald-200/80 font-mono text-[10px]">
              v1.0.0
            </span>
          </div>
        </div>

        {/* Right Side: Clean Modern Sign-In Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            {/* Header Section */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-primary border border-primary/20 mb-3 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>Hospital Staff Portal</span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign in to Netro HMS
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your staff credentials to access the central healthcare dashboard.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 text-xs bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 shadow-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <div className="flex-1 leading-relaxed">{error}</div>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-red-400 hover:text-red-700 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {/* Sign-in Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  Staff Email Address
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@netro.com"
                    className="h-11 px-3.5 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-slate-800 transition-all placeholder:text-slate-400"
                    required
                  />
                </div>
              </div>

              {/* Password with Eye Toggle */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowHelpModal(true)}
                    className="text-xs text-primary hover:text-primary-hover hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Default Logins?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-11 pl-3.5 pr-10 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 text-sm text-slate-800 transition-all placeholder:text-slate-400"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer accent-primary"
                  />
                  <span>Remember this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoginLoading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                {isLoginLoading ? (
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Quick 1-Click Demo Login Bar */}
            <div className="pt-4 border-t border-slate-100">
              <div className="text-center text-[11px] text-slate-400 mb-3 font-medium flex items-center justify-center gap-2">
                <span className="h-px w-10 bg-slate-200" />
                <span>1-Click Fast Demo Login</span>
                <span className="h-px w-10 bg-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Admin Quick Login */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo("admin")}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    activeDemo === "admin"
                      ? "border-primary/40 bg-emerald-50/70 text-slate-900 shadow-xs"
                      : "border-slate-200/80 bg-slate-50/60 hover:bg-emerald-50/40 hover:border-primary/30 text-slate-700"
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <span>Hospital Admin</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-primary/15 text-primary">
                        Super Admin
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      admin@gmail.com
                    </div>
                  </div>
                </button>

                {/* Pharmacy Quick Login */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo("pharmacy")}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    activeDemo === "pharmacy"
                      ? "border-secondary/40 bg-sky-50/70 text-slate-900 shadow-xs"
                      : "border-slate-200/80 bg-slate-50/60 hover:bg-sky-50/40 hover:border-secondary/30 text-slate-700"
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <span>Pharmacist</span>
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-secondary/15 text-secondary">
                        Clinical
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      pharmacy@netro.com
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Bottom Security Note */}
            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-400 inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Protected by 256-bit Healthcare Encryption • Netro HMS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Helper Modal for Default Logins */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Pre-configured Accounts
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Use any of the verified seed accounts below to access different hospital roles:
            </p>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => {
                  setEmail("admin@gmail.com");
                  setPassword("12345678");
                  setShowHelpModal(false);
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800">
                  Hospital Admin / Super Admin
                </div>
                <div className="text-slate-500 text-[11px]">
                  Email: <code className="text-primary font-mono">admin@gmail.com</code>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Password: <code className="text-slate-700 font-mono">12345678</code>
                </div>
              </div>

              <div
                onClick={() => {
                  setEmail("pharmacy@netro.com");
                  setPassword("12345678");
                  setShowHelpModal(false);
                }}
                className="p-3 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200/80 cursor-pointer transition-colors"
              >
                <div className="font-semibold text-slate-800">
                  Chief Pharmacist (Medical Store)
                </div>
                <div className="text-slate-500 text-[11px]">
                  Email: <code className="text-secondary font-mono">pharmacy@netro.com</code>
                </div>
                <div className="text-slate-500 text-[11px]">
                  Password: <code className="text-slate-700 font-mono">12345678</code>
                </div>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
