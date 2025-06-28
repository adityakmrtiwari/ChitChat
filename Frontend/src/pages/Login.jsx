import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api, { API_ENDPOINTS } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Footer from '../components/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    if (user) navigate('/rooms');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const res = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      login(res.data.user, res.data.token);
      navigate('/rooms');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          <Card className="bg-black/95 backdrop-blur-xl border-blue-900/50 shadow-2xl">
            <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6 md:p-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
                className="mx-auto"
              >
                <img src="/logo.jpeg" alt="ChitChat Logo" className="h-12 w-12 sm:h-16 sm:w-16 rounded-full object-cover mx-auto shadow-lg" />
              </motion.div>
              <div>
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Welcome Back</CardTitle>
                <CardDescription className="text-gray-300 text-sm">
                  Sign in to your ChitChat account
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 md:p-8 pt-0">
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-blue-900/20 border-blue-700/50 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50 h-11 sm:h-12 text-sm sm:text-base"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-blue-900/20 border-blue-700/50 text-white placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50 h-11 sm:h-12 text-sm sm:text-base"
                  />
                </motion.div>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2 sm:p-3"
                  >
                    {error}
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full gradient-btn-primary py-2 sm:py-3 h-11 sm:h-12 text-sm sm:text-base font-medium"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </motion.div>
              </form>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center"
              >
                <p className="text-gray-300 text-sm">
                  Don't have an account?{' '}
                  <Link 
                    to="/register" 
                    className="text-white hover:text-gray-300 font-medium transition-colors underline"
                  >
                    Create one
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login; 