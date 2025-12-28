import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, Settings, LogOut } from 'lucide-react';
import { SidebarItem } from '../components/ui/SidebarItem'; // <--- Importamos el componente

export default function MainLayout() {
  
  const menuItems = [
    { path: '/', label: 'Panel', icon: <LayoutDashboard size={20} /> },
    { path: '/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { path: '/rutinas', label: 'Rutinas', icon: <Dumbbell size={20} /> }, // Ejemplo
    { path: '/configuracion', label: 'Configuración', icon: <Settings size={20} /> }, // Ejemplo
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* Sidebar Fijo */}
      <aside className="w-64 bg-white border-r border-gray-100 shadow-sm hidden md:flex flex-col fixed h-screen top-0 left-0 z-30">
        <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">Functional</span>
                <span className="text-sm font-bold text-blue-600 tracking-widest uppercase">Kids</span>
            </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem 
                key={item.path} 
                path={item.path} 
                label={item.label} 
                icon={item.icon} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-2xl transition-colors group">
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal con margen para el sidebar */}
      <main className="md:ml-64 p-6 md:p-10">
        <Outlet />
      </main>
      
    </div>
  );
}