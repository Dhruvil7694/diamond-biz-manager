
import React from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainMenuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
    },
    {
      name: 'Diamond Entry',
      path: '/diamonds',
      icon: <Gem className="w-5 h-5 mr-2" />,
    },
    {
      name: 'Clients',
      path: '/clients',
      icon: <Users className="w-5 h-5 mr-2" />,
    },
    {
      name: 'Invoices',
      path: '/invoices',
      icon: <FileText className="w-5 h-5 mr-2" />,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <BarChart className="w-5 h-5 mr-2" />,
    },
  ];

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
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-sidebar border-r">
        <div className="p-4 border-b flex items-center">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-diamond-300 to-diamond-600 flex items-center justify-center mr-3">
            <Gem className="text-white h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-diamond-900">DBMS</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1">
            {mainMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-diamond-100 text-diamond-800"
                      : "hover:bg-diamond-50 text-slate-700 hover:text-diamond-800"
                  )}
                >
                  {item.icon}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-diamond-100 text-diamond-800">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2">
                <p className="text-sm font-medium">{getUserDisplayName()}</p>
                <p className="text-xs text-muted-foreground">{(user as any).email || 'hiren.patel@example.com'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden border-b flex justify-between items-center p-4 w-full">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-diamond-300 to-diamond-600 flex items-center justify-center mr-2">
            <Gem className="text-white h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold text-diamond-900">DBMS</h1>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center h-8">
              Menu <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {mainMenuItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link to={item.path} className="flex items-center cursor-pointer w-full">
                  {item.icon}
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem className="flex items-center text-destructive" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-auto">
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
