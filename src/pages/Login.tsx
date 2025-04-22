import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Gem, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useViewport } from '@/contexts/ViewportContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

// Form validation types
type ValidationError = {
  username?: string;
  password?: string;
};

const Login = () => {
  // State management
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationError>({});
  const [touched, setTouched] = useState({ username: false, password: false });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Context hooks
  const { login, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useViewport();
  useTheme();
  
  // Refs
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Focus on username input when component mounts
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
    
    // Check for stored username if user had "remember me" checked previously
    const storedUsername = localStorage.getItem('rememberedUsername');
    if (storedUsername) {
      setUsername(storedUsername);
      setRememberMe(true);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Username validation
  const validateUsername = (value: string): string | undefined => {
    if (!value) return 'Username is required';
    return undefined;
  };

  // Password validation
  const validatePassword = (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  // Handle input blur for validation
  const handleBlur = (field: 'username' | 'password') => {
    setTouched({ ...touched, [field]: true });
    
    if (field === 'username') {
      const usernameError = validateUsername(username);
      setErrors(prev => ({ ...prev, username: usernameError }));
    } else if (field === 'password') {
      const passwordError = validatePassword(password);
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  // Handle input change
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    if (touched.username) {
      const usernameError = validateUsername(value);
      setErrors(prev => ({ ...prev, username: usernameError }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      const passwordError = validatePassword(value);
      setErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set all fields as touched for validation
    setTouched({ username: true, password: true });
    
    // Validate inputs
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(password);
    const newErrors = { username: usernameError, password: passwordError };
    setErrors(newErrors);
    
    // Return if there are errors
    if (usernameError || passwordError) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    // Store username if "remember me" is checked
    if (rememberMe) {
      localStorage.setItem('rememberedUsername', username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }
    
    setIsSubmitting(true);
    
    try {
      // Handle login with case-insensitive username
      const normalizedUsername = username.toLowerCase();
      const success = await login(normalizedUsername, password);
      if (success) {
        toast.success('Login successful');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-diamond-200 via-diamond-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 flex items-center justify-center p-3 sm:p-4 relative overflow-hidden"
      onKeyDown={handleKeyDown}
    >
      {/* Animated gradient background elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 -left-10 w-72 h-72 bg-diamond-300 dark:bg-diamond-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-600 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="absolute -bottom-10 right-20 w-72 h-72 bg-diamond-200 dark:bg-diamond-700 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-6000"></div>
      </div>
      
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <div
          className="rounded-full p-1 transition-transform duration-200 hover:scale-105 focus-within:ring-2 focus-within:ring-blue-400"
        >
          <ThemeToggle />
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/help')}
                aria-label="Help"
                className="bg-white/20 dark:bg-gray-800/30 backdrop-blur-lg rounded-full px-4 shadow-lg border border-white/30 dark:border-gray-700/30 text-diamond-600 dark:text-diamond-400 hover:bg-white/40 dark:hover:bg-gray-700/50 transition-all duration-300 hover:shadow-xl"
              >
                Help
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Need help signing in?</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Two-column layout container */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-2xl rounded-2xl overflow-hidden relative z-10">
        {/* Left column - Branding */}
        <div className="md:w-2/5 bg-gradient-to-br from-diamond-600 to-diamond-800 dark:from-diamond-700 dark:to-diamond-900 text-white p-8 md:p-12 flex flex-col justify-between">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Minimal Diamond Logo */}
            <div className="mb-8 flex items-center justify-center md:justify-start">
              <div className="relative">
                <svg viewBox="0 0 100 100" width="60" height="60" className="drop-shadow-md">
                  <defs>
                    <linearGradient id="diamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                    </linearGradient>
                  </defs>
                  <polygon 
                    points="50,10 90,50 50,90 10,50" 
                    fill="url(#diamondGradient)" 
                    stroke="#ffffff" 
                    strokeWidth="2"
                  />
                  <polygon 
                    points="50,20 80,50 50,80 20,50" 
                    fill="none" 
                    stroke="#ffffff" 
                    strokeWidth="1" 
                    strokeOpacity="0.6"
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Rashi Diamonds</h1>
            <p className="text-diamond-100 opacity-90 mb-6">Streamline your operations and maximize productivity with our comprehensive business management solution.</p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm">
              <h3 className="font-medium mb-2 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2" />
                Secure Access
              </h3>
              <p className="text-sm text-diamond-100">Your data is protected with enterprise-grade security and encryption.</p>
            </div>
            
            <p className="text-sm text-diamond-100 opacity-70">© 2025 Rashi Diamonds. All rights reserved.</p>
          </motion.div>
        </div>
        
        {/* Right column - Login form */}
        <div className="md:w-3/5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 sm:p-8 md:p-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-md mx-auto"
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Enter your credentials to access your account</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="username" className="text-sm dark:text-gray-300">Username</Label>
                  <AnimatePresence>
                    {touched.username && !errors.username && username && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-green-500 flex items-center text-xs"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Valid
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder={isMobile ? "Username" : "Enter your username"}
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={() => handleBlur('username')}
                    ref={usernameInputRef}
                    required
                    aria-invalid={errors.username ? 'true' : 'false'}
                    aria-describedby={errors.username ? "username-error" : undefined}
                    className={`bg-white dark:bg-gray-700/70 border focus-visible:ring-diamond-500 h-11 text-sm dark:text-white dark:placeholder:text-gray-400 transition-all ${
                      touched.username && errors.username 
                        ? 'border-red-500 dark:border-red-400 pr-10' 
                        : touched.username && !errors.username && username 
                          ? 'border-green-500 dark:border-green-400' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-diamond-300 dark:hover:border-diamond-500/50'
                    }`}
                  />
                  {touched.username && errors.username && (
                    <AlertCircle className="h-5 w-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  )}
                </div>
                <AnimatePresence>
                  {touched.username && errors.username && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      id="username-error"
                      className="text-red-500 dark:text-red-400 text-xs mt-1"
                    >
                      {errors.username}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm dark:text-gray-300">Password</Label>
                  <AnimatePresence>
                    {touched.password && !errors.password && password && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="text-green-500 flex items-center text-xs"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Valid
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    required
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={`bg-white dark:bg-gray-700/70 border focus-visible:ring-diamond-500 h-11 text-sm dark:text-white pr-10 transition-all ${
                      touched.password && errors.password 
                        ? 'border-red-500 dark:border-red-400' 
                        : touched.password && !errors.password && password 
                          ? 'border-green-500 dark:border-green-400' 
                          : 'border-gray-200 dark:border-gray-600 hover:border-diamond-300 dark:hover:border-diamond-500/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {touched.password && errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      id="password-error"
                      className="text-red-500 dark:text-red-400 text-xs mt-1"
                    >
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 rounded border-gray-300 text-diamond-600 focus:ring-diamond-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-diamond-600 dark:text-diamond-400 hover:text-diamond-800 dark:hover:text-diamond-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-diamond-600 hover:bg-diamond-700 h-12 text-sm transition-all duration-300 relative overflow-hidden group shadow-lg shadow-diamond-500/20 border border-transparent hover:border-diamond-400/30 rounded-lg"
                disabled={isLoading || isSubmitting}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-[-100%] group-hover:translate-x-[100%]"></span>
                <span className="flex items-center justify-center font-medium">
                  {(isLoading || isSubmitting) ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="mr-2 h-4 w-4" />
                  )}
                  Sign In Securely
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account? <Link to="/contact" className="text-diamond-600 dark:text-diamond-400 hover:text-diamond-800 dark:hover:text-diamond-300 font-medium transition-colors">Contact admin</Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      
      {/* Subtle footer accent */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-diamond-500 via-diamond-300 to-diamond-500 z-10"></div>
    </motion.div>
  );
};

export default Login;