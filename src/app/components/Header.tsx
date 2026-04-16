// Header component - displays page title, search bar, notifications, and user profile
import { Search, Bell, ChevronDown, User, Settings as SettingsIcon, LogOut, Menu } from 'lucide-react';
import { useNavigate } from 'react-router';

// Props interface for Header component
interface HeaderProps {
  pageTitle: string; // Title to display in the header
  onMenuClick?: () => void; // Callback for mobile menu button click
  onSearch?: (query: string) => void; // Callback for search input changes
  searchPlaceholder?: string; // Placeholder text for search input
}

// Header component with search, notifications, and user profile dropdown
export function Header({ pageTitle, onMenuClick, onSearch, searchPlaceholder }: HeaderProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };
  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left Side - Mobile Menu Button and Page Title */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button - only visible on small screens */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5 text-[#6B7280]" />
        </button>

        <h1 className="text-lg md:text-xl font-semibold text-[#111827]">{pageTitle}</h1>
      </div>

      {/* Right Side - Search, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* Search Bar - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2 w-64">
          <Search className="w-4 h-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder={searchPlaceholder || "Search..."}
            onChange={(e) => onSearch?.(e.target.value)}
            className="bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none flex-1"
          />
        </div>

        {/* Notification Bell with indicator */}
        <div className="relative">
          <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-[#6B7280]" />
            {/* Red dot indicator for new notifications */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full"></span>
          </button>
        </div>

        {/* Admin Avatar & Dropdown Menu */}
        <div className="relative group">
          <button className="flex items-center gap-2 p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <div className="w-8 h-8 bg-[#374151] rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#6B7280] hidden sm:block" />
          </button>

          {/* Dropdown Menu - appears on hover */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E7EB] rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            <div className="p-2">
              {/* Profile option */}
              <button 
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">Profile</span>
              </button>
              {/* Account Settings option */}
              <button className="w-full flex items-center gap-3 px-3 py-2 text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <SettingsIcon className="w-4 h-4" />
                <span className="text-sm">Account Settings</span>
              </button>
              {/* Divider */}
              <div className="my-1 border-t border-[#E5E7EB]"></div>
              {/* Logout option */}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}