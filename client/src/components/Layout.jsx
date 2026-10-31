import React, { useState, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { GenerativeArtScene } from './ui/anomalous-matter-hero';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#030306] text-slate-100 flex overflow-x-hidden selection:bg-cyan-500 selection:text-black font-sans">
      {/* Jet Black + Royal Amethyst + Electric Cyan Ambient Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Royal Amethyst upper ambient glow */}
        <div className="absolute -top-32 left-1/4 w-[650px] h-[650px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
        {/* Electric Cyan touch glow */}
        <div className="absolute top-1/2 -right-20 w-[450px] h-[450px] rounded-full bg-cyan-500/8 blur-[140px] pointer-events-none" />
        
        {/* 3D Wireframe Scene - High Radiance */}
        <div className="absolute inset-0 opacity-65">
          <Suspense fallback={null}>
            <GenerativeArtScene />
          </Suspense>
        </div>
        
        {/* Smooth Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030306]/50 to-[#030306]/90 pointer-events-none" />
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
