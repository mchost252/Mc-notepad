import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pb-16">
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default Layout;