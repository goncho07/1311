import React from 'react';
import Header from './Header';
import TeacherSidebar from './TeacherSidebar';
import { useUIStore } from '@/store/uiStore';

interface LayoutProps {
  children: React.ReactNode;
}

const TeacherLayout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarCollapsed } = useUIStore();

  const sidebarOffset = isSidebarCollapsed ? 'md:ml-24' : 'md:ml-64';

  return (
    <div className="relative min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <TeacherSidebar />
      <div className={`flex min-h-screen flex-col transition-[margin] duration-300 ease-in-out ${sidebarOffset}`}>
        <Header />
        <main className="flex flex-1 flex-col px-3 pb-6 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-screen-2xl flex-1 flex-col gap-4">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;