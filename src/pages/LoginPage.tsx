import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/AuthContext';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Floating animation for background elements
  const [positions, setPositions] = useState(
    Array(5).fill(0).map(() => ({
      x: Math.random() * 80,
      y: Math.random() * 80,
      size: Math.random() * 10 + 5,
      opacity: Math.random() * 0.3 + 0.1,
      delay: Math.random() * 5
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev => prev.map(item => ({
        ...item,
        x: Math.random() * 80,
        y: Math.random() * 80,
        opacity: Math.random() * 0.3 + 0.1
      })));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        className: 'border-0 shadow-lg backdrop-blur-md bg-opacity-80',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://attendane-api.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.toLowerCase().trim(),
          password: form.password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.error });
        }

        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      await login(data.user, data.token);

      toast({
        title: '🎉 Access Granted',
        description: 'Welcome back to your dashboard!',
        className: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg backdrop-blur-md',
      });

      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        variant: 'destructive',
        title: '⚠️ Access Denied',
        description: err.message || 'An unexpected error occurred. Please try again.',
        className: 'border-0 shadow-lg backdrop-blur-md bg-opacity-80',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 overflow-hidden relative p-4">
      {/* Animated background elements */}
      {positions.map((pos, index) => (
        <motion.div
          key={index}
          initial={{ x: pos.x, y: pos.y, opacity: pos.opacity }}
          animate={{ x: pos.x, y: pos.y, opacity: pos.opacity }}
          transition={{ duration: 10, delay: pos.delay, repeat: Infinity, repeatType: 'reverse' }}
          className="absolute rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
          style={{
            width: `${pos.size}rem`,
            height: `${pos.size}rem`,
            filter: 'blur(40px)',
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-gray-800 bg-opacity-50 backdrop-blur-lg border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 p-1"></div>
          <CardHeader className="space-y-2">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
            </motion.div>
            <CardDescription className="text-center text-gray-400">
              Ready to continue your journey?
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-300">
                  Email Address
                </Label>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="your@email.com"
                    className={`${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-600 focus-visible:ring-blue-500'} bg-gray-700/50 text-gray-200 placeholder-gray-500 py-3 h-12 rounded-lg border`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 mt-1 flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-300">
                    Password
                  </Label>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      to="/forgot-password"
                      className="text-sm font-medium text-blue-400 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </motion.div>
                </div>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className={`${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-gray-600 focus-visible:ring-blue-500'} bg-gray-700/50 text-gray-200 placeholder-gray-500 py-3 h-12 rounded-lg border`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-sm text-red-400 mt-1 flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
            <div className="px-6 pb-6 pt-2">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg shadow-lg transition-all relative overflow-hidden"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">Unlock Dashboard</span>
                      <motion.span
                        initial={{ x: -100, opacity: 0 }}
                        animate={isHovered ? { x: 0, opacity: 0.2 } : { x: 100, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-white/20"
                      />
                    </>
                  )}
                </Button>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="text-center text-sm text-gray-400 mt-4"
              >
                New here?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-blue-400 hover:underline"
                >
                  Create an account
                </Link>
              </motion.div>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;