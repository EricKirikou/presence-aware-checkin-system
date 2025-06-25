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
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' 
        },
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
      <div 
        className="absolute inset-0 overflow-hidden opacity-20 cyberpunk-grid"
        style={{
          transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`
        }}
      />

      {/* Animated scanlines */}
      <div className="absolute inset-0 scanlines opacity-10 pointer-events-none" />

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

      {/* Digital rain effect */}
      <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <span 
            key={i} 
            className="absolute text-green-400 font-mono text-xs"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `fall ${Math.random() * 5 + 3}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            {String.fromCharCode(0x30A0 + Math.random() * 96)}
          </span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md z-10"
      >
        <Card className="cyberpunk-card">
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
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-orbitron tracking-wider text-glow-lg">
                SYSTEM ACCESS
              </CardTitle>
            </motion.div>
            <CardDescription className="text-center text-cyan-300/70 font-share-tech-mono text-xs tracking-wider">
              ENTER CREDENTIALS TO PROCEED
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-cyan-300/80 font-share-tech-mono tracking-wider relative">
                  USER IDENTIFIER
                  <span className="ml-1 animate-pulse">_</span>
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
                    className={`${errors.email ? 'border-red-500 focus-visible:ring-red-500' : 'border-cyan-500/30 focus-visible:ring-cyan-500'} cyberpunk-input ${activeInput === 'email' ? 'shadow-lg shadow-cyan-500/20' : ''}`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-400 mt-1 flex items-center gap-1 font-share-tech-mono"
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
                  <Label htmlFor="password" className="text-sm font-medium text-cyan-300/80 font-share-tech-mono tracking-wider relative">
                    SECURITY KEY
                    <span className="ml-1 animate-pulse">_</span>
                  </Label>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-cyan-400 hover:underline font-share-tech-mono tracking-wider"
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
                    value={form.password.split('').map(() => '•').join('')}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className={`${errors.password ? 'border-red-500 focus-visible:ring-red-500' : 'border-cyan-500/30 focus-visible:ring-cyan-500'} cyberpunk-input tracking-widest ${activeInput === 'password' ? 'shadow-lg shadow-cyan-500/20' : ''}`}
                  />
                </motion.div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm text-red-400 mt-1 flex items-center gap-1 font-share-tech-mono"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Fingerprint scanner alternative */}
              <div className="pt-4 flex justify-center">
                <motion.div 
                  className="fingerprint-scanner"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-cyan-400"
                  >
                    <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4"></path>
                    <path d="M5 19.5C5.5 18 6 15 6 12c0-.7.12-1.37.34-2"></path>
                    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"></path>
                    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"></path>
                    <path d="M8.65 22c.21-.66.45-1.32.57-2"></path>
                    <path d="M14 13.12c0 2.38 0 6.38-1 8.88"></path>
                    <path d="M2 16h.01"></path>
                    <path d="M21.8 16c.2-2 .131-5.354 0-6"></path>
                    <path d="M9 6.8a6 6 0 0 1 9 5.2c0 .47 0 1.17-.02 2"></path>
                  </svg>
                </motion.div>
              </div>
            </CardContent>

            <div className="px-6 pb-6 pt-2 space-y-4">
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 cyberpunk-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      <span className="relative z-10">AUTHENTICATING...</span>
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
                className="text-center text-xs text-cyan-400/70 font-share-tech-mono tracking-wider"
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
        <p className="text-xs text-cyan-500/50 font-share-tech-mono tracking-widest">
          SYSTEM v3.1.4 | SECURITY PROTOCOL ACTIVE
        </p>
      </div>
    </div>
  );
};

export default LoginPage;