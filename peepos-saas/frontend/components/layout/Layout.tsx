import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useUIStore } from '@/store/uiStore';
import Breadcrumbs from '@/ui/Breadcrumbs';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarCollapsed } = useUIStore();

  const sidebarOffset = isSidebarCollapsed ? 'md:ml-24' : 'md:ml-64';

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <Sidebar />
      <div className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out ${sidebarOffset}`}>
        <Header />
        <main className="flex flex-1 flex-col px-3 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
            <Breadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;