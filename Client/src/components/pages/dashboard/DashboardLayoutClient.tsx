'use client';

import DashboardNavbar from '@/components/pages/dashboard/DashboardNavbar';
import DashboardSidebar from '@/components/pages/dashboard/DashboardSidebar';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

interface DashboardLayoutClientProps {
  children: ReactNode;
}

export default function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ✅ Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Memoized resize handler
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 768;
    const tablet = window.innerWidth < 1024;

    setIsMobile(prevMobile => {
      const shouldCollapse = mobile || tablet;

      if (prevMobile !== mobile) {
        setCollapsed(shouldCollapse);
        return mobile;
      }

      setCollapsed(prevCollapsed => {
        if (shouldCollapse !== prevCollapsed) {
          return shouldCollapse;
        }
        return prevCollapsed;
      });

      return prevMobile;
    });
  }, []);

  useEffect(() => {
    if (!isClient) return;

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize, isClient]);

  const handleToggleCollapse = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const gridClass = useMemo(() => {
    if (isMobile) return 'grid-cols-1';
    return collapsed ? 'grid-cols-[80px_1fr]' : 'grid-cols-[240px_1fr]';
  }, [isMobile, collapsed]);

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen grid transition-all duration-300 ${gridClass} overflow-x-hidden`}>
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={collapsed}
        isMobile={isMobile}
        onCollapse={handleToggleCollapse}
      />

      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={handleToggleCollapse}
        />
      )}

      {/* Main Content Area */}
      <div className={`grid grid-rows-[auto_1fr] ${isMobile ? 'col-start-1' : ''}`}>
        {/* Navbar */}
        <DashboardNavbar
        //   collapsed={collapsed}
          isMobile={isMobile}
          onToggle={handleToggleCollapse}
        />

        {/* Content Area */}
        <main className="overflow-auto relative custom-scrollbar">
          <div className="p-4 sm:p-6 md:p-8 xl:p-10 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
