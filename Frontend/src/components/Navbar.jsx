import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Show back button on pages that aren't main pages
  const showBack = !['/', '/login', '/register'].includes(location.pathname);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-black/95 backdrop-blur-xl border-b border-blue-900/50 text-white py-2 sm:py-3 px-3 sm:px-6 flex justify-between items-center fixed top-0 z-50"
    >
      <div className="flex items-center gap-2 sm:gap-4">
        {showBack && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-blue-500/20 border border-blue-700/50 p-1.5 sm:p-2 text-sm"
            >
              ← <span className="hidden sm:inline">Back</span>
            </Button>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 sm:gap-4"
        >
          <Link to="/" className="flex items-center gap-1 sm:gap-2 hover:text-gray-300 transition-colors">
            <img src="/logo.jpeg" alt="ChitChat Logo" className="h-5 w-5 sm:h-8 sm:w-8 rounded-full object-cover" />
            <span className="font-bold text-base sm:text-xl tracking-wide">ChitChat</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-sm text-red-300 hover:text-red-200 transition-colors font-medium"
              >
                Admin Panel
              </Link>
            )}
          </div>
        </motion.div>
      </div>
      
      {user && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 sm:gap-4"
        >
          <span className="font-medium hidden sm:inline text-gray-300 text-sm">
            Welcome, {user.username}
            {user.role === 'admin' && (
              <span className="ml-2 text-red-300 text-xs">(Admin)</span>
            )}
          </span>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full hover:bg-blue-500/20 p-0">
                <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs sm:text-sm">
                    {user.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-black/95 backdrop-blur-xl border border-blue-900/50" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">{user.username}</p>
                  <p className="text-xs leading-none text-gray-400">
                    {user.email}
                  </p>
                  {user.role === 'admin' && (
                    <p className="text-xs leading-none text-red-400">Administrator</p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user.role === 'admin' && (
                <>
                  <DropdownMenuItem 
                    onClick={() => navigate('/admin')}
                    className="text-red-300 hover:bg-red-500/20"
                  >
                    Admin Panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem className="text-white hover:bg-blue-500/20">
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-blue-500/20">
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:bg-red-500/20">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar; 