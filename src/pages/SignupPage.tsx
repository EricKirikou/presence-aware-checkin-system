import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Home, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme ? savedTheme === 'dark' : systemPrefersDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);
  const goToLandingPage = () => navigate('/');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    if (form.name.trim().length < 2) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Name must be at least 2 characters',
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please enter a valid email address',
      });
      return false;
    }

    if (form.password.length < 8) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Password must be at least 8 characters',
      });
      return false;
    }

    if (form.password !== form.confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Passwords do not match',
      });
      return false;
    }

    return true;
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;
  setIsLoading(true);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (data?.error === 'User already exists') {
        toast({
          variant: 'destructive',
          title: 'Email Already Registered',
          description: 'The email you entered is already in use. Please use a different one or log in.',
        });
        return;
      }

      throw new Error(data.error || data.message || 'Registration failed');
    }

    toast({
      title: 'Registration Successful',
      description: 'Your account has been created!',
    });

    navigate('/login');
  } catch (error: unknown) {
    const err = error as Error;
    toast({
      variant: 'destructive',
      title: 'Registration Error',
      description: err.message || 'Failed to create account',
    });
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-200">
      {/* Navigation and Theme Controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button
          onClick={goToLandingPage}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go to home page"
        >
          <Home className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
        >
          {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-700" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="relative overflow-hidden border-0 shadow-xl dark:border dark:border-gray-700 bg-white dark:bg-gray-800 transition-all duration-200">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          <CardHeader className="text-center space-y-1 pt-8">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">Join our community today</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your full name"
                  disabled={isLoading}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus-visible:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus-visible:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus-visible:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  disabled={isLoading}
                  className={`dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus-visible:ring-blue-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 mt-2">
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
