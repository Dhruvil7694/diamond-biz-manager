import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCircle, 
  Gem, 
  Users, 
  FileText, 
  BarChart, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  Settings,
  Bell,
  Search,
  ChevronLeft,
  HelpCircle,
  Home,
  Sparkles,
  ArrowRight,
  Layers,
  Calculator,
  Activity,
  Clock,
  Briefcase,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuShortcut
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useViewport, Breakpoint } from '@/contexts/ViewportContext';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';
import EnhancedTopClientsChart from '@/components/EnhancedTopClientsChart';


interface LayoutProps {
  children: React.ReactNode;
}

// Define sidebar widths for different states
const SIDEBAR_FULL_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 70;
const SIDEBAR_MOBILE_WIDTH = '85vw';

// Activity data for notifications
const recentActivities = [
  { 
    id: 1, 
    title: "New invoice created", 
    description: "Invoice #INV-2023-004 for Mehta Diamonds", 
    time: "10 minutes ago",
    icon: <FileText className="h-4 w-4" />,
    unread: true
  },
  { 
    id: 2, 
    title: "Rate update", 
    description: "Market rates have been updated", 
    time: "2 hours ago",
    icon: <Activity className="h-4 w-4" />,
    unread: true
  },
  { 
    id: 3, 
    title: "Diamond entry added", 
    description: "12 new diamonds added to inventory", 
    time: "Yesterday",
    icon: <Gem className="h-4 w-4" />,
    unread: false
  },
  { 
    id: 4, 
    title: "New client added", 
    description: "Added Joshi Enterprises to clients", 
    time: "2 days ago",
    icon: <Users className="h-4 w-4" />,
    unread: false
  }
];

// Project shortcuts data
const projectShortcuts = [
  { 
    name: "Create Invoice", 
    description: "Generate a new invoice for client", 
    path: "/invoices/new",
    icon: FileText 
  },
  { 
    name: "View Reports", 
    description: "Monthly analytics dashboard", 
    path: "/analytics",
    icon: BarChart 
  }
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { breakpoint, width } = useViewport();
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  
  // Initialize sidebar collapsed state based on viewport
  useEffect(() => {
    // Auto-collapse on tablet, expanded on desktop, hidden on mobile
    if (breakpoint === Breakpoint.TABLET) {
      setSidebarCollapsed(true);
    } else if (breakpoint === Breakpoint.DESKTOP) {
      setSidebarCollapsed(false);
    } else {
      setSidebarOpen(false);
    }
  }, [breakpoint]);

  // Listen for scroll events to apply header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette with / key
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        if (searchRef.current) {
          setTimeout(() => {
            searchRef.current?.focus();
          }, 100);
        }
      }
      
      // Toggle sidebar with Alt+S
      if (e.key === 's' && e.altKey) {
        e.preventDefault();
        if (breakpoint === Breakpoint.MOBILE) {
          setSidebarOpen(!sidebarOpen);
        } else {
          setSidebarCollapsed(!sidebarCollapsed);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen, sidebarCollapsed, breakpoint]);

  // Handle clicks outside sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        breakpoint === Breakpoint.MOBILE && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        sidebarOpen
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, breakpoint]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (breakpoint === Breakpoint.MOBILE) {
      setSidebarOpen(false);
    }
  }, [location.pathname, breakpoint]);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    if (breakpoint === Breakpoint.MOBILE) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const mainMenuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview of your diamond business'
    },
    {
      name: 'Diamond Entry',
      path: '/diamonds',
      icon: <Gem className="w-5 h-5" />,
      description: 'Manage diamond inventory'
    },
    {
      name: 'Clients',
      path: '/clients',
      icon: <Users className="w-5 h-5" />,
      description: 'Client management and details'
    },
    {
      name: 'Invoices',
      path: '/invoices',
      icon: <FileText className="w-5 h-5" />,
      description: 'Billing and payments'
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Business insights and reports'
    },
  ];

  // Secondary menu items
  const secondaryMenuItems = [
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'System preferences'
    },
    {
      name: 'System Status',
      path: '/settings/system',
      icon: <Activity className="w-5 h-5" />,
      description: 'Monitor system resources'
    },
    {
      name: 'Help & Support',
      path: '/help',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Get assistance'
    },
  ];

  // Get current page name
  const currentPageName = useMemo(() => {
    const matchedItem = mainMenuItems.find(item => item.path === location.pathname) || 
                        secondaryMenuItems.find(item => item.path === location.pathname);
    return matchedItem?.name || 'Dashboard';
  }, [location.pathname, mainMenuItems, secondaryMenuItems]);

  // Filter menu items by search query
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    
    return [
      ...mainMenuItems.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
      ),
      ...secondaryMenuItems.filter(item => 
        item.name.toLowerCase().includes(lowerQuery) || 
        item.description.toLowerCase().includes(lowerQuery)
      )
    ];
  }, [searchQuery, mainMenuItems, secondaryMenuItems]);

  const markAllNotificationsAsRead = () => {
    setUnreadNotifications(0);
  };

  if (!user) {
    return <>{children}</>;
  }

  // Get user name (specific to our custom user implementation)
  const getUserDisplayName = () => {
    return (user as any).name || 'Hiren Patel';
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = getUserDisplayName();
    if (name) {
      return name.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return 'HP';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-gray-900">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && breakpoint === Breakpoint.MOBILE && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed md:relative z-50 h-screen bg-white dark:bg-gray-800 border-r border-border dark:border-gray-700 transition-all duration-300 ease-in-out flex flex-col",
          breakpoint === Breakpoint.MOBILE 
            ? sidebarOpen 
              ? "left-0" 
              : `-left-[${SIDEBAR_MOBILE_WIDTH}]`
            : "left-0",
          sidebarCollapsed && breakpoint !== Breakpoint.MOBILE
            ? `w-[${SIDEBAR_COLLAPSED_WIDTH}px]`
            : breakpoint === Breakpoint.MOBILE
              ? `w-[${SIDEBAR_MOBILE_WIDTH}]`
              : `w-[${SIDEBAR_FULL_WIDTH}px]`
        )}
        style={{
          width: breakpoint === Breakpoint.MOBILE 
            ? sidebarOpen ? SIDEBAR_MOBILE_WIDTH : 0
            : sidebarCollapsed 
              ? SIDEBAR_COLLAPSED_WIDTH 
              : SIDEBAR_FULL_WIDTH,
          boxShadow: (sidebarOpen && breakpoint === Breakpoint.MOBILE) ? '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b dark:border-gray-700 flex items-center justify-between px-4">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center overflow-hidden">
                <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-diamond-300 to-diamond-600 flex items-center justify-center">
                  <Gem className="text-white h-5 w-5 md:h-6 md:w-6" />
                </div>
                <AnimatePresence initial={false}>
                  <motion.div 
                    layout
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="ml-4 flex items-center space-x-2 px-3 py-1 rounded-lg shadow-sm bg-white/80 dark:bg-diamond-900/30 backdrop-blur-sm"
                  >
                    <h1 className="text-lg font-semibold text-diamond-900 dark:text-white whitespace-nowrap">
                      Rashi Diamonds
                    </h1>
                  </motion.div>
                </AnimatePresence>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button 
                      onClick={toggleSidebar}
                      className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Collapse Sidebar
                    <TooltipShortcut>Alt+S</TooltipShortcut>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          ) : (
            /* When sidebar is collapsed, only show the centered arrow button */
            <div className="flex justify-center items-center w-full h-full">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSidebarCollapsed(false)}
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-diamond-200 dark:hover:bg-diamond-800 text-diamond-700 dark:text-diamond-300"
                      aria-label="Expand Sidebar"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Expand Sidebar
                    <TooltipShortcut>Alt+S</TooltipShortcut>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        {/* Search bar - only visible when sidebar is expanded */}
        <AnimatePresence initial={false}>
          {(!sidebarCollapsed || breakpoint === Breakpoint.MOBILE) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 py-3"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search or use ⌘+/" 
                  className="pl-9 h-9 text-sm bg-secondary dark:bg-gray-700 dark:text-gray-200 dark:placeholder:text-gray-400"
                  onFocus={() => {
                    setSearchFocused(true);
                    setCommandPaletteOpen(true);
                  }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  onClick={() => setCommandPaletteOpen(true)}
                />
                {searchFocused && (
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    ⌘+/
                  </span>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Navigation */}
        <ScrollArea className="flex-grow h-[calc(100vh-12rem)]">
          <div className={cn(
            "py-2",
            sidebarCollapsed ? "px-1" : "px-3"
          )}>
            {/* Primary Navigation */}
            <div className="mb-4">
              <h2 className={cn(
                "text-xs font-semibold text-muted-foreground dark:text-gray-400 mb-2 px-3",
                sidebarCollapsed && breakpoint !== Breakpoint.MOBILE && "sr-only"
              )}>
                Main
              </h2>
              <ul className="space-y-1">
                {mainMenuItems.map((item) => (
                  <TooltipProvider key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <li>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center py-2 rounded-md text-sm font-medium transition-colors",
                              location.pathname === item.path
                                ? "bg-diamond-100 text-diamond-900 dark:bg-diamond-900/20 dark:text-diamond-300"
                                : "text-muted-foreground dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
                              sidebarCollapsed && breakpoint !== Breakpoint.MOBILE 
                                ? "justify-center px-2" 
                                : "justify-start px-3"
                            )}
                          >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <AnimatePresence initial={false}>
                              {(!sidebarCollapsed || breakpoint === Breakpoint.MOBILE) && (
                                <motion.span 
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: 'auto' }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-3 whitespace-nowrap"
                                >
                                  {item.name}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Link>
                        </li>
                      </TooltipTrigger>
                      {sidebarCollapsed && breakpoint !== Breakpoint.MOBILE && (
                        <TooltipContent side="right">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </ul>
            </div>
            
            {/* Recent Projects Section */}
            <AnimatePresence initial={false}>
              {(!sidebarCollapsed || breakpoint === Breakpoint.MOBILE) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                >
                  <h2 className="text-xs font-semibold text-muted-foreground dark:text-gray-400 mb-2 px-3 flex items-center">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-diamond-500" />
                    Quick Actions
                  </h2>
                  <div className="px-3 space-y-2">
                    {projectShortcuts.map((project, index) => (
                      <Link 
                        key={index} 
                        to={project.path}
                        className="block"
                      >
                        <div className="flex items-start p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                          <div className="bg-diamond-100 dark:bg-diamond-900/20 rounded-md p-1.5 text-diamond-600 dark:text-diamond-300">
                            <project.icon className="h-4 w-4" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</p>
                            <p className="text-xs text-muted-foreground">{project.description}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Secondary Navigation */}
            <div className="mt-4">
              <h2 className={cn(
                "text-xs font-semibold text-muted-foreground dark:text-gray-400 mb-2 px-3",
                sidebarCollapsed && breakpoint !== Breakpoint.MOBILE && "sr-only"
              )}>
                Preferences
              </h2>
              <ul className="space-y-1">
                {secondaryMenuItems.map((item) => (
                  <TooltipProvider key={item.path}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <li>
                          <Link
                            to={item.path}
                            className={cn(
                              "flex items-center py-2 rounded-md text-sm font-medium transition-colors",
                              location.pathname === item.path
                                ? "bg-diamond-100 text-diamond-900 dark:bg-diamond-900/20 dark:text-diamond-300"
                                : "text-muted-foreground dark:text-gray-300 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white",
                              sidebarCollapsed && breakpoint !== Breakpoint.MOBILE 
                                ? "justify-center px-2" 
                                : "justify-start px-3"
                            )}
                          >
                            <span className="flex-shrink-0">{item.icon}</span>
                            <AnimatePresence initial={false}>
                              {(!sidebarCollapsed || breakpoint === Breakpoint.MOBILE) && (
                                <motion.span 
                                  initial={{ opacity: 0, width: 0 }}
                                  animate={{ opacity: 1, width: 'auto' }}
                                  exit={{ opacity: 0, width: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="ml-3 whitespace-nowrap"
                                >
                                  {item.name}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Link>
                        </li>
                      </TooltipTrigger>
                      {sidebarCollapsed && breakpoint !== Breakpoint.MOBILE && (
                        <TooltipContent side="right">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                          </div>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </ul>
            </div>
          </div>
        </ScrollArea>
        
        {/* User Profile */}
        <div className="border-t dark:border-gray-700 mt-auto">
          <div className={cn(
            "p-4 flex",
            sidebarCollapsed && breakpoint !== Breakpoint.MOBILE 
              ? "justify-center" 
              : "justify-between items-center"
          )}>
            {(sidebarCollapsed && breakpoint !== Breakpoint.MOBILE) ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-gray-700">
                      <AvatarFallback className="bg-diamond-100 text-diamond-800 dark:bg-diamond-800 dark:text-diamond-100">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="center" className="w-56">
                  <div className="p-2 flex flex-col items-center">
                    <Avatar className="h-14 w-14 mb-2">
                      <AvatarFallback className="bg-diamond-100 text-diamond-800 dark:bg-diamond-800 dark:text-diamond-100 text-lg">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {(user as any).email || 'hiren.patel@example.com'}
                    </p>
                    <Button variant="outline" size="sm" className="mt-2 w-full text-xs" onClick={() => navigate('/profile')}>
                      Manage Account
                    </Button>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {mainMenuItems.map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="cursor-pointer">
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 ring-2 ring-gray-100 dark:ring-gray-700">
                    <AvatarFallback className="bg-diamond-100 text-diamond-800 dark:bg-diamond-800 dark:text-diamond-100">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <AnimatePresence initial={false}>
                  {(!sidebarCollapsed || breakpoint === Breakpoint.MOBILE) && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3 overflow-hidden"
                  >
                    <p className="font-medium text-sm whitespace-nowrap dark:text-white">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400 truncate max-w-[160px]">
                      {(user as any).email || 'hiren.patel@example.com'}
                    </p>
                  </motion.div>
                )}
                </AnimatePresence>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
                      >
                        <Avatar className="h-full w-full">
                          <AvatarFallback className="bg-diamond-100 text-diamond-800 dark:bg-diamond-800 dark:text-diamond-100 text-sm font-medium">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align="end" 
                      className="w-64 animate-in fade-in-80 zoom-in-95 p-2"
                      sideOffset={6}
                    >
                      <div className="p-3 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
                        <Avatar className="h-16 w-16 mb-3 shadow-sm border-2 border-white dark:border-gray-800">
                          <AvatarFallback className="bg-diamond-100 text-diamond-800 dark:bg-diamond-800 dark:text-diamond-100 text-lg font-medium">
                            {getInitials()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-semibold">{getUserDisplayName()}</p>
                        <p className="text-xs text-muted-foreground dark:text-gray-400 truncate max-w-full mt-1">
                          {(user as any).email || 'hiren.patel@example.com'}
                        </p>
                        <div className="mt-3 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs justify-center font-medium w-full"
                            onClick={() => navigate('/settings')}
                          >
                            Account Settings
                          </Button>
                        </div>
                      </div>
                      <div className="px-1 py-2">
                        <DropdownMenuItem 
                          className="px-3 py-2 cursor-pointer rounded-md"
                          onClick={() => navigate('/settings')}
                        >
                          <Settings className="h-4 w-4 mr-2 opacity-70" />
                          Settings & Profile
                          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="px-1 py-2">
                        <DropdownMenuItem 
                          onClick={handleLogout} 
                          className="px-3 py-2 text-destructive dark:text-red-400 cursor-pointer rounded-md hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      
      {/* Main Content */}
      <div className={cn(
        "flex flex-col flex-1 max-h-screen overflow-hidden transition-all duration-300",
        breakpoint === Breakpoint.MOBILE
          ? "w-full"
          : sidebarCollapsed
            ? `ml-[${SIDEBAR_COLLAPSED_WIDTH}px]`
            : `ml-[${SIDEBAR_FULL_WIDTH}px]`,
       )}
       style={{
         marginLeft: breakpoint === Breakpoint.MOBILE
           ? 0
           : sidebarCollapsed
             ? SIDEBAR_COLLAPSED_WIDTH
             : 0,
       }}
      >
        {/* Top Header - Only visible on mobile */}
        {breakpoint === Breakpoint.MOBILE && (
          <header className={cn(
            "h-16 border-b dark:border-gray-700 flex items-center justify-between px-4 bg-white dark:bg-gray-800 z-10",
            scrolled && "shadow-sm"
          )}>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2" 
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-diamond-300 to-diamond-600 flex items-center justify-center">
                  <Gem className="text-white h-5 w-5" />
                </div>
                <h1 className="ml-2 text-lg font-bold text-diamond-900 dark:text-white">RD</h1>
              </div>
            </div>
            
            {/* <div className="flex items-center space-x-1">
              <ThemeToggle />
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-diamond-100 text-diamond-800 dark:bg-diamond-800 dark:text-diamond-100">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b dark:border-gray-700">
                    <p className="font-medium">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground dark:text-gray-400">
                      {(user as any).email || 'hiren.patel@example.com'}
                    </p>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <UserCircle className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {mainMenuItems.map((item) => (
                    <DropdownMenuItem key={item.path} asChild>
                      <Link to={item.path} className="cursor-pointer">
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}
          </header>
        )}
        
        {/* Top Header for Tablet/Desktop */}
        {breakpoint !== Breakpoint.MOBILE && (
          <header className={cn(
            "h-16 border-b dark:border-gray-700 flex items-center justify-between px-6 bg-white dark:bg-gray-800 z-10",
            scrolled && "shadow-sm"
          )}>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2 md:hidden" 
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {currentPageName}
              </h2>
              
              <nav className="hidden md:flex ml-8 space-x-1">
                {mainMenuItems.slice(0, 3).map((item) => (
                  <Button
                    key={item.path}
                    variant={location.pathname === item.path ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "text-sm",
                      location.pathname === item.path 
                        ? "bg-diamond-100 text-diamond-900 dark:bg-diamond-900/20 dark:text-diamond-300" 
                        : ""
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                ))}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <span>More</span>
                      <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {mainMenuItems.slice(3).map((item) => (
                      <DropdownMenuItem key={item.path} asChild>
                        <Link to={item.path} className="cursor-pointer">
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </nav>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm px-2.5 py-1.5 h-auto"
                  onClick={() => setQuickActionsOpen(true)}
                >
                  <Sparkles className="h-4 w-4 mr-1 text-diamond-500" />
                  <span>Quick Actions</span>
                </Button>
              </div>
              
              <ThemeToggle />
              
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-700">
                    <h3 className="font-medium">Notifications</h3>
                    {unreadNotifications > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-8" onClick={markAllNotificationsAsRead}>
                        Mark all as read
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[300px]">
                    {recentActivities.map((activity) => (
                      <div 
                        key={activity.id} 
                        className={cn(
                          "px-4 py-2 border-b dark:border-gray-700 last:border-0 flex items-start",
                          activity.unread && "bg-diamond-50 dark:bg-diamond-900/10"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center",
                          activity.unread 
                            ? "bg-diamond-100 text-diamond-600 dark:bg-diamond-900/20 dark:text-diamond-300" 
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                        )}>
                          {activity.icon}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-start justify-between">
                            <p className={cn(
                              "text-sm",
                              activity.unread ? "font-medium" : ""
                            )}>
                              {activity.title}
                            </p>
                            {activity.unread && (
                              <span className="h-2 w-2 rounded-full bg-diamond-500"></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="p-2 border-t dark:border-gray-700">
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      View all notifications
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate('/profile')}>
                <AvatarFallback className="bg-diamond-100 text-diamond-800 dark:bg-diamond-800 dark:text-diamond-100">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
          </header>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
      
      {/* Command Palette Dialog */}
      <Dialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
        <DialogContent className="sm:max-w-[500px] p-0">
          <div className="px-4 py-3 border-b dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                ref={searchRef}
                placeholder="Search for pages, features, or help..." 
                className="pl-9 h-10 bg-transparent border-none focus:ring-0 text-base"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <ScrollArea className="max-h-[300px] overflow-y-auto">
            {searchQuery ? (
              <>
                {filteredMenuItems.length > 0 ? (
                  <div className="py-2">
                    {filteredMenuItems.map((item) => (
                      <div 
                        key={item.path} 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-start"
                        onClick={() => {
                          navigate(item.path);
                          setCommandPaletteOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="h-6 w-6 rounded-md bg-diamond-100 dark:bg-diamond-900/20 flex items-center justify-center text-diamond-600 dark:text-diamond-300">
                          {item.icon}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">No results found</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="px-2 py-3">
                  <h4 className="px-2 text-xs font-medium text-muted-foreground mb-2">Quick Actions</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {projectShortcuts.map((shortcut, index) => (
                      <div 
                        key={index}
                        className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex flex-col items-center text-center"
                        onClick={() => {
                          navigate(shortcut.path);
                          setCommandPaletteOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="h-8 w-8 rounded-md bg-diamond-100 dark:bg-diamond-900/20 flex items-center justify-center text-diamond-600 dark:text-diamond-300 mb-1">
                          <shortcut.icon className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-medium truncate w-full">{shortcut.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="px-2 py-3 border-t dark:border-gray-700">
                  <h4 className="px-2 text-xs font-medium text-muted-foreground mb-2">Recently Visited</h4>
                  <div className="space-y-1">
                    {mainMenuItems.slice(0, 4).map((item) => (
                      <div 
                        key={item.path} 
                        className="px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer flex items-center"
                        onClick={() => {
                          navigate(item.path);
                          setCommandPaletteOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        <div className="h-5 w-5 text-muted-foreground">
                          {item.icon}
                        </div>
                        <span className="ml-2 text-sm">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </ScrollArea>
          
          <div className="px-4 py-2 border-t dark:border-gray-700 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex space-x-3">
              <span className="flex items-center">
                <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs mr-1">↑↓</span>
                Navigate
              </span>
              <span className="flex items-center">
                <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs mr-1">⏎</span>
                Select
              </span>
            </div>
            <span className="flex items-center">
              <span className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs mr-1">Esc</span>
              Close
            </span>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Quick Actions Dialog */}
      <Dialog open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-diamond-500" />
              Quick Actions
            </DialogTitle>
            <DialogDescription>
              Perform common tasks with a single click
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-2">
            {projectShortcuts.map((shortcut, index) => (
              <div 
                key={index}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-start"
                onClick={() => {
                  navigate(shortcut.path);
                  setQuickActionsOpen(false);
                }}
              >
                <div className="h-9 w-9 rounded-md bg-diamond-100 dark:bg-diamond-900/20 flex items-center justify-center text-diamond-600 dark:text-diamond-300">
                  <shortcut.icon className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{shortcut.name}</p>
                  <p className="text-xs text-muted-foreground">{shortcut.description}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setQuickActionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper component for tooltip shortcuts
const TooltipShortcut = ({ children }: { children: React.ReactNode }) => (
  <kbd className="ml-auto text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
    {children}
  </kbd>
);

export default Layout;