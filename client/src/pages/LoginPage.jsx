import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Zap,
} from 'lucide-react';
import DeskLamp from '../components/DeskLamp';

export default function LoginPage() {
  const navigate = useNavigate();

  // Lamp state: starts OFF, automatically turns ON after 1 second
  const [isLampOn, setIsLampOn] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [lightMode, setLightMode] = useState('gold'); // 'gold' | 'cyan'

  // Tab state: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status feedback
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-ignite lamp 1 second after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLampOn(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Quick-fill Demo Account
  const handleQuickFill = () => {
    setActiveTab('login');
    setLoginEmail('demo@privacyguard.ai');
    setLoginPassword('DemoPass123!');
    setErrors({});
  };

  // Login Validation & Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};
    if (!loginEmail.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(loginEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!loginPassword) {
      newErrors.password = 'Password is required.';
    } else if (loginPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Authentication verified. Welcome to PRIVACYGUARD AI!');
      localStorage.setItem('privacyguard_token', 'demo_jwt_session_token_2026');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    }, 700);
  };

  // Register Validation & Submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage('');

    const newErrors = {};
    if (!registerName.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!registerEmail.trim()) {
      newErrors.regEmail = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(registerEmail)) {
      newErrors.regEmail = 'Please enter a valid email address.';
    }

    if (!registerPassword) {
      newErrors.regPassword = 'Password is required.';
    } else if (registerPassword.length < 6) {
      newErrors.regPassword = 'Password must be at least 6 characters.';
    }

    if (registerPassword !== registerConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms & Privacy Policy.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage('Account registered successfully! Redirecting to command center...');
      localStorage.setItem('privacyguard_token', 'demo_jwt_session_token_2026');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1300);
    }, 800);
  };

  const isGold = lightMode === 'gold';
  const activeAccent = isGold ? 'text-amber-400' : 'text-sky-400';
  const activeBorder = isGold ? 'border-amber-500/40' : 'border-sky-500/40';
  const activeBg = isGold ? 'bg-amber-500/10' : 'bg-sky-500/10';

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-slate-950 via-[#040814] to-black text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-black overflow-x-hidden font-sans">
      {/* Top Header Bar */}
      <header className="relative z-30 h-16 px-4 sm:px-8 flex items-center justify-between border-b border-white/5 bg-black/30 backdrop-blur-md">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white text-sm font-mono">
            PRIVACYGUARD <span className={activeAccent}>AI</span>
          </span>
        </Link>

        {/* Lamp Controls: Manual Toggle & Color Modes */}
        <div className="flex items-center space-x-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-lg bg-black/50 border border-white/10 text-xs font-mono">
            <button
              type="button"
              onClick={() => setLightMode('gold')}
              className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
                isGold ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Warm Gold</span>
            </button>
            <button
              type="button"
              onClick={() => setLightMode('cyan')}
              className={`px-2.5 py-1 rounded transition-all flex items-center space-x-1 ${
                !isGold ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-400/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline">Cyan Blue</span>
            </button>
          </div>

          {/* Lamp ON/OFF Button */}
          <button
            type="button"
            onClick={() => setIsLampOn(!isLampOn)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all flex items-center space-x-1.5 ${
              isLampOn
                ? isGold
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-sky-500/20 text-sky-300 border-sky-400/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isLampOn ? (isGold ? 'bg-amber-400 animate-pulse' : 'bg-sky-400 animate-pulse') : 'bg-slate-600'
              }`}
            />
            <span>{isLampOn ? 'Lamp ON' : 'Lamp OFF'}</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Cinematic Layout */}
      <main className="relative z-20 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* ================= LEFT COLUMN: ANIMATED DESK LAMP ================= */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start justify-center relative">
          {/* Subtle Ambient Title over lamp */}
          <div className="mb-2 text-center lg:text-left z-20">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 mb-2">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>CINEMATIC ILLUMINATION</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Illuminate Your <br className="hidden sm:block" />
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isGold ? 'from-amber-300 via-amber-400 to-yellow-500' : 'from-sky-300 via-cyan-400 to-indigo-400'}`}>
                Digital Privacy & Trust
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md font-mono">
              Pull the brass cord or toggle switches to direct volumetric light onto the security gateway.
            </p>
          </div>

          {/* Desk Lamp Component */}
          <DeskLamp
            isOn={isLampOn}
            onToggle={() => setIsLampOn(!isLampOn)}
            isFocused={isFocused}
            mode={lightMode}
          />

          <p className="text-[11px] font-mono text-slate-500 mt-1 hidden lg:block">
            Tip: Focus on any input field to focus the lamp's light beam intensity.
          </p>
        </div>

        {/* ================= RIGHT COLUMN: GLASSMORPHISM AUTHENTICATION CARD ================= */}
        <div className="w-full lg:w-[480px] shrink-0 relative z-20">
          <div
            className={`w-full rounded-2xl p-6 sm:p-8 transition-all duration-500 ${
              isGold ? 'glass-panel-lamp-gold' : 'glass-panel-lamp-cyan'
            }`}
          >
            {/* Tab Switcher: Login / Create Account */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrors({});
                  }}
                  className={`text-sm font-semibold pb-1.5 transition-all border-b-2 font-mono ${
                    activeTab === 'login'
                      ? `${activeAccent} ${activeBorder} border-current`
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setErrors({});
                  }}
                  className={`text-sm font-semibold pb-1.5 transition-all border-b-2 font-mono ${
                    activeTab === 'register'
                      ? `${activeAccent} ${activeBorder} border-current`
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Quick Fill Button */}
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-mono text-slate-400 hover:text-amber-300 px-2 py-1 rounded bg-white/5 border border-white/10 transition-colors"
                title="Pre-fills demo credentials"
              >
                1-Click Demo
              </button>
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <div className="mb-5 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in-long">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setSuccessMessage('Google SSO authenticated in sandbox mode.')}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all hover:scale-[1.02]"
              >
                {/* Google SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.3 0 15.2c0 2.9.7 5.6 1.9 8l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => setSuccessMessage('Apple ID authenticated in sandbox mode.')}
                className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all hover:scale-[1.02]"
              >
                {/* Apple SVG */}
                <svg className="w-4 h-4 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.41-9.79-11.48-20.73-15.19-32.83-3.71-12.1-5.57-23.36-5.57-33.79 0-14.45 3.75-26.4 11.27-35.85 7.52-9.45 16.89-14.28 28.12-14.5 4.9.11 10.42 1.34 16.54 3.71 6.13 2.37 10.24 3.66 12.33 3.87 2.09-.21 6.36-1.55 12.8-4.04 6.45-2.48 11.83-3.66 16.14-3.54 12.31.55 22.36 4.96 30.13 13.23-10.78 6.53-16.05 15.68-15.82 27.46.22 9.14 3.82 16.92 10.8 23.32 4.13 3.79 8.87 6.49 14.2 8.1-2.19 6.54-4.8 12.98-7.85 19.33zM119.22 31.86c0-7.39 2.68-14.46 8.04-21.21 5.37-6.75 12.04-10.65 20.02-11.71.11 1.09.16 2.18.16 3.26 0 7.18-2.73 14.3-8.2 21.36-5.46 7.07-12.09 11-19.87 11.8-0.1-1.1-.15-2.26-.15-3.5z" />
                </svg>
                <span>Apple</span>
              </button>
            </div>

            <div className="relative flex py-2 items-center mb-5">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[11px] font-mono text-slate-500 uppercase">
                Or Continue With Email
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* TAB 1: LOGIN FORM */}
            {activeTab === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={loginEmail}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono font-medium text-slate-300">Password</label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset link simulated in sandbox mode.');
                      }}
                      className="text-[11px] font-mono text-slate-400 hover:text-amber-300 transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-amber-500 bg-black/60 border-white/20 focus:ring-amber-400 cursor-pointer"
                    />
                    <span>Remember this workstation for 30 days</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
                    isGold
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/25'
                      : 'bg-sky-400 hover:bg-sky-300 text-black shadow-sky-500/25'
                  } hover:scale-[1.01]`}
                >
                  {isSubmitting ? (
                    <span>Authenticating Gateway...</span>
                  ) : (
                    <>
                      <span>Sign In to PrivacyGuard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* TAB 2: CREATE ACCOUNT FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={registerName}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="Sarah Vance"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* Register Email */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Corporate / Personal Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      value={registerEmail}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="s.vance@security.org"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all"
                    />
                  </div>
                  {errors.regEmail && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.regEmail}</span>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.regPassword && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.regPassword}</span>
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-mono font-medium text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={registerConfirmPassword}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-10 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.confirmPassword}</span>
                    </p>
                  )}
                </div>

                {/* Terms and conditions */}
                <div className="pt-1">
                  <label className="flex items-start space-x-2 text-[11px] text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-amber-500 bg-black/60 border-white/20 focus:ring-amber-400 cursor-pointer"
                    />
                    <span>
                      I agree to the Zero-Persistence Privacy Policy and Confidentiality Terms.
                    </span>
                  </label>
                  {errors.terms && (
                    <p className="text-[11px] text-rose-400 mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.terms}</span>
                    </p>
                  )}
                </div>

                {/* Submit Register */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 rounded-xl font-mono text-xs font-bold transition-all shadow-lg flex items-center justify-center space-x-2 ${
                    isGold
                      ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-amber-500/25'
                      : 'bg-sky-400 hover:bg-sky-300 text-black shadow-sky-500/25'
                  } hover:scale-[1.01]`}
                >
                  {isSubmitting ? (
                    <span>Registering Operator...</span>
                  ) : (
                    <>
                      <span>Create Free Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Card Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Zero data persistence</span>
              <Link to="/scanner" className={`${activeAccent} hover:underline`}>
                Bypass & Scan &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Bottom Credit */}
      <footer className="relative z-20 py-4 px-4 text-center text-[11px] font-mono text-slate-500 border-t border-white/5">
        <span>PRIVACYGUARD AI — Animated Volumetric Lamp Authentication. All rights reserved.</span>
      </footer>
    </div>
  );
}

