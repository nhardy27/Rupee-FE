// Sidebar component - navigation menu with collapsible functionality
import { useNavigate } from 'react-router';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  FolderOpen,
  FileType,
  CreditCard,
  Shield,
  FileText,
  Settings,
  ChevronLeft,
  LogOut,
  Activity,
  Brain,
} from 'lucide-react';
import { cn } from '../components/ui/utils';

// Props interface for Sidebar component
interface SidebarProps {
  collapsed: boolean; // Whether sidebar is collapsed
  onToggle: () => void; // Callback to toggle sidebar
  activeItem: string; // Currently active menu item
  onNavigate: (item: string) => void; // Callback when navigating to a menu item
}

// Menu items configuration with icons and labels
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'types', label: 'Types', icon: FileType },
  { id: 'categories', label: 'Categories', icon: FolderOpen },
  { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard },
  { id: 'roles', label: 'Roles & Permissions', icon: Shield },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { id: 'ai-questions', label: 'AI Questions', icon: Brain },
  { id: 'audit-logs', label: 'Audit Logs', icon: Activity },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Sidebar navigation component with collapsible menu
export function Sidebar({ collapsed, onToggle, activeItem, onNavigate }: SidebarProps) {
  const navigate = useNavigate();

  // Handle navigation to a menu item
  const handleNavigation = (itemId: string) => {
    onNavigate(itemId);
    navigate(`/${itemId}`);
  };

  // Handle logout - clear tokens and redirect to login
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    navigate('/');
  };
  
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-[#F9FAFB] border-r border-[#E5E7EB] transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB]">
        {/* Logo text - hidden when collapsed */}
        {!collapsed && (
          <span className="font-semibold text-[#111827]">PaisaTrack</span>
        )}
        {/* Toggle button to collapse/expand sidebar */}
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-[#F3F4F6] rounded-lg transition-colors"
        >
          <ChevronLeft
            className={cn(
              'w-5 h-5 text-[#6B7280] transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                isActive
                  ? 'bg-[#F3F4F6] text-[#111827]'
                  : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {/* Label - hidden when collapsed */}
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile Section */}
      <div className="p-3 border-t border-[#E5E7EB]">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-[#F3F4F6] transition-colors',
            collapsed && 'justify-center'
          )}
        >
          {/* Admin avatar */}
          <div className="w-8 h-8 bg-[#374151] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          {/* Admin info - hidden when collapsed */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827] truncate">Admin User</p>
              <p className="text-xs text-[#6B7280] truncate">admin@humbingo.com</p>
            </div>
          )}
        </div>
        {/* Logout button - hidden when collapsed */}
        {!collapsed && (
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 mt-2 text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
}