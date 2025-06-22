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
  const [activeInput, setActiveInput] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Cyberpunk grid animation
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    
    if (!form.email) {
      newErrors.email = 'Authentication required';
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Invalid credentials format';
    }
    
    if (!form.password) {
      newErrors.password = 'Security clearance needed';
    } else if (form.password.length < 6) {
      newErrors.password = 'Minimum 6 characters required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'ACCESS DENIED',
        description: 'Invalid authentication parameters',
        className: 'bg-red-900/80 border-red-500/50 text-red-100',
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

        throw new Error(data.error || 'Security protocol violation');
      }

      await login(data.user, data.token);

      toast({
        title: 'ACCESS GRANTED',
        description: 'Welcome to the system',
        className: 'bg-green-900/80 border-green-500/50 text-green-100',
      });

      navigate('/dashboard');
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        variant: 'destructive',
        title: 'INTRUSION DETECTED',
        description: err.message || 'Security breach attempt logged',
        className: 'bg-red-900/80 border-red-500/50 text-red-100',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden relative p-4">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div 
          className="absolute inset-0 bg-grid-pattern"
          style={{
            backgroundSize: '40px 40px',
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`
          }}
        />
      </div>

      {/* Animated scanlines */}
      <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

      {/* Neon glow elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100, y: Math.random() * 100 }}
            animate={{
              x: [null, Math.random() * 100],
              y: [null, Math.random() * 100]
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear'
            }}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              background: `radial-gradient(circle, rgba(110, 231, 255, ${Math.random() * 0.2 + 0.05}) 0%, transparent 70%)`,
              filter: 'blur(40px)'
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-black/70 backdrop-blur-sm border border-cyan-500/20 rounded-none shadow-2xl shadow-cyan-500/20 relative overflow-hidden">
          {/* Cyberpunk corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
          
          {/* Animated header bar */}
          <div className="h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent relative overflow-hidden">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
            />
          </div>
          
          <CardHeader className="space-y-3">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-mono tracking-wider">
                SYSTEM ACCESS
              </CardTitle>
            </motion.div>
            <CardDescription className="text-center text-cyan-300/70 font-mono text-xs tracking-wider">
              ENTER CREDENTIALS TO PROCEED
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-cyan-300/80 font-mono tracking-wider">
                  USER IDENTIFIER
                </Label>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  onFocus={() => setActiveInput('email')}
                  onBlur={() => setActiveInput(null)}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="user@domain.com"
                    className={`${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-cyan-500/30 focus-visible:ring-cyan-500'} bg-black/50 text-cyan-100 placeholder-cyan-500/50 py-3 h-12 rounded-none border font-mono tracking-wider transition-all ${activeInput === 'email' ? 'shadow-lg shadow-cyan-500/20' : ''}`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-400 mt-1 flex items-center gap-1 font-mono"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-cyan-300/80 font-mono tracking-wider">
                    SECURITY KEY
                  </Label>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-cyan-400 hover:underline font-mono tracking-wider"
                    >
                      KEY RECOVERY
                    </Link>
                  </motion.div>
                </div>
                <motion.div 
                  whileHover={{ scale: 1.01 }}
                  onFocus={() => setActiveInput('password')}
                  onBlur={() => setActiveInput(null)}
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className={`${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-cyan-500/30 focus-visible:ring-cyan-500'} bg-black/50 text-cyan-100 placeholder-cyan-500/50 py-3 h-12 rounded-none border font-mono tracking-wider transition-all ${activeInput === 'password' ? 'shadow-lg shadow-cyan-500/20' : ''}`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-400 mt-1 flex items-center gap-1 font-mono"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>

            <div className="px-6 pb-6 pt-2 space-y-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-cyan-600/90 to-purple-600/90 hover:from-cyan-500/90 hover:to-purple-500/90 text-white rounded-none shadow-lg font-mono tracking-wider relative overflow-hidden group border border-cyan-400/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">INITIATE ACCESS</span>
                      <motion.span
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      />
                    </>
                  )}
                </Button>
              </motion.div>

              <motion.p 
                whileHover={{ scale: 1.02 }}
                className="text-center text-xs text-cyan-400/70 font-mono tracking-wider"
              >
                NEW USER?{' '}
                <Link
                  to="/signup"
                  className="font-medium text-cyan-400 hover:underline"
                >
                  REQUEST CLEARANCE
                </Link>
              </motion.p>
            </div>
          </form>
        </Card>
      </motion.div>

      {/* Terminal-like footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs text-cyan-500/50 font-mono tracking-widest">
          SYSTEM v3.1.4 | SECURITY PROTOCOL ACTIVE
        </p>
      </div>
    </div>
  );
};

export default LoginPage;