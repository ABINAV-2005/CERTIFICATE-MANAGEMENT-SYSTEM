import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  LayoutDashboard,
  FileText,
  FilePlus,
  UploadCloud,
  LayoutTemplate,
  PlusCircle,
  Users,
  User,
  BarChart3,
  CheckCircle2,
  History,
  MessageSquare,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Award
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'user', 'verifier'] },
  { path: '/app/certificates', label: 'Certificates', icon: FileText, roles: ['admin', 'user'] },
  { path: '/app/certificates/upload', label: 'Upload Certificate', icon: UploadCloud, roles: ['admin', 'user'] },
  { path: '/app/certificates/create', label: 'Create Certificate', icon: FilePlus, roles: ['admin'] },
  { path: '/app/templates', label: 'Templates', icon: LayoutTemplate, roles: ['admin'] },
  { path: '/app/templates/create', label: 'Create Template', icon: PlusCircle, roles: ['admin'] },
  { path: '/app/users', label: 'Users', icon: Users, roles: ['admin'] },
  { path: '/app/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin'] },
  { path: '/app/verifier-tools', label: 'Verifier Tools', icon: CheckCircle2, roles: ['admin', 'verifier'] },
  { path: '/app/activity', label: 'Activity', icon: History, roles: ['admin', 'user', 'verifier'] },
  { path: '/app/social', label: 'Friends & Chat', icon: MessageSquare, roles: ['user', 'admin'] },
];

const MainLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role)
  );

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Certify</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transition-transform duration-300 lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2 px-6 border-b">
            <Award className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl">Certify</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <NavLink to="/app/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </NavLink>
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="min-h-screen p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;

