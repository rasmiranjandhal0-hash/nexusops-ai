import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { GenerativeArtScene } from './ui/anomalous-matter-hero';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-black text-slate-100 flex overflow-x-hidden selection:bg-sky-500 selection:text-black">
      {/* Persistent Spatial 3D Generative Anomaly in Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-35 overflow-hidden">
        <Suspense fallback={null}>
          <GenerativeArtScene />
        </Suspense>
        {/* Spatial Depth Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/75 to-black pointer-events-none" />
      </div>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="relative z-10 flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
