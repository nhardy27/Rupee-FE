// Layout component - provides consistent page structure with sidebar and header
import { useState, ReactNode, useEffect } from 'react';
import { useLocation } from 'react-router';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { cn } from '../components/ui/utils';

// Props interface for Layout component
interface LayoutProps {
  children: ReactNode; // Page content to render
  pageTitle: string; // Title to display in header
  onSearch?: (query: string) => void; // Optional search callback
  searchPlaceholder?: string; // Optional search placeholder text
}

// Main layout wrapper component with sidebar and header
export function Layout({ children, pageTitle, onSearch, searchPlaceholder }: LayoutProps) {
  const location = useLocation();
  // State for sidebar collapse on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  // State for mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get active menu item from current URL path
  const getActiveItem = () => {
    const path = location.pathname.replace('/', '');
    return path || 'dashboard';
  };
  
  const [activeMenuItem, setActiveMenuItem] = useState(getActiveItem());

  // Update active menu item when route changes
  useEffect(() => {
    setActiveMenuItem(getActiveItem());
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Sidebar - Desktop (hidden on mobile) */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen z-40">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeMenuItem}
          onNavigate={setActiveMenuItem}
        />
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Dark overlay background */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          ></div>
          {/* Sidebar for mobile */}
          <div className="relative">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileMenuOpen(false)}
              activeItem={activeMenuItem}
              onNavigate={(item) => {
                setActiveMenuItem(item);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Content Area - adjusts margin based on sidebar state */}
      <div className={cn('transition-all duration-300', sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60')}>
        {/* Header with page title and search */}
        <Header
          pageTitle={pageTitle}
          onMenuClick={() => setMobileMenuOpen(true)}
          onSearch={onSearch}
          searchPlaceholder={searchPlaceholder}
        />
        {/* Page content */}
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
