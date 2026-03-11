import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Heart, Home, Sparkles, BookOpen, Moon, Sun, LogOut, LogIn, User, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ChatAgent from "@/components/chat/ChatAgent";
import InteractiveBackground from "@/components/background/InteractiveBackground";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
  };

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  const navigationItems = [
    { name: "Home", url: createPageUrl("Home"), icon: Home },
    { name: "Plan Date", url: createPageUrl("PlanDate"), icon: Sparkles },
    { name: "My Plans", url: createPageUrl("SavedPlans"), icon: BookOpen },
    { name: "Calendar", url: createPageUrl("Calendar"), icon: Calendar },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white'}`}>
      {/* Interactive Background */}
      {!darkMode && <InteractiveBackground />}
      
      {/* Optimized Background Elements (Dark Mode) */}
      {darkMode && <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute text-yellow-300"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
              delay: i * 0.5,
            }}
          >
            ⭐
          </motion.div>
        ))}

        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
        />
        <motion.div 
          className="absolute top-40 right-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: [0.4, 0, 0.2, 1], delay: 2 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"
          animate={{ x: [0, 20, 0], y: [0, -30, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 30, repeat: Infinity, ease: [0.4, 0, 0.2, 1], delay: 4 }}
        />
      </div>}

      <style>
        {`
          :root {
            --primary-pink: #f8bbd9;
            --primary-purple: #a855f7;
            --warm-cream: #fef7f0;
            --soft-lavender: #e879f9;
            --romantic-rose: #fb7185;
          }
          .dark {
            --primary-pink: #ec4899;
            --primary-purple: #9333ea;
            --warm-cream: #1f2937;
            --soft-lavender: #d946ef;
            --romantic-rose: #f43f5e;
          }
          .romantic-gradient {
            background: linear-gradient(135deg, var(--primary-pink) 0%, var(--soft-lavender) 100%);
          }
          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
        `}
      </style>
      
      {/* Header */}
      <header className={`sticky top-0 z-50 relative ${darkMode ? 'bg-gray-900/80' : 'bg-white/60'} backdrop-blur-xl border-b ${darkMode ? 'border-gray-700' : 'border-pink-100/50'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to={createPageUrl("Home")} className="flex items-center space-x-2">
              <div className="w-10 h-10 romantic-gradient rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                PerfectDate
              </span>
            </Link>
            
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const isActive = item.url === "/"
                  ? location.pathname === item.url
                  : location.pathname.startsWith(item.url);
                return (
                  <Link
                    key={item.name}
                    to={item.url}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                        : darkMode
                        ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                        : 'text-gray-700 hover:text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-pink-600'}`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>

              {!loading && (
                <>
                  {isAuthenticated ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-pink-600'}`}
                        >
                          <User className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 py-2 border-b">
                          <p className="text-sm font-medium">{user?.user_metadata?.full_name || 'User'}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link to={createPageUrl("Profile")} className="flex items-center w-full">
                            <User className="w-4 h-4 mr-2" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button
                      onClick={handleLogin}
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`min-h-screen relative z-10 ${darkMode ? 'text-white' : ''}`}>
        {children}
      </main>

      {/* Chat Agent */}
      <ChatAgent />

      {/* Footer */}
      <footer className={`py-12 relative z-10 ${darkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-pink-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-pink-500" />
              <span className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                PerfectDate
              </span>
            </div>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Creating magical moments, one date at a time
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              Made with ❤️ for couples everywhere
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}