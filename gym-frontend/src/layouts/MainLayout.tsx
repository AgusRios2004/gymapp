import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/ui/SIdebar';
import { Menu, X } from 'lucide-react';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-white text-slate-900 font-sans">
      {/* Mobile Hamburger Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-slate-200 text-emerald-600 active:scale-95 transition-all"
        aria-label="Abrir menú"
      >
        {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 p-4 sm:p-8 transition-all duration-300 w-full overflow-x-hidden min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;