import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, Dumbbell, CreditCard, LogOut } from 'lucide-react';
import { SidebarItem } from '../components/ui/SidebarItem'; // <--- Importamos el componente

export default function MainLayout() {
  
  const menuItems = [
    { path: '/', label: 'Panel', icon: <LayoutDashboard size={20} /> },
    { path: '/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { path: '/rutinas', label: 'Rutinas', icon: <Dumbbell size={20} /> },
    { path: '/pagos', label: 'Pagos', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      
      <aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-green-600 flex items-center gap-2">
            <Dumbbell className="fill-current" />
            Funcional Kids
          </h1>
          <p className="text-xs text-gray-500 mt-1">Panel de Profesor</p>
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
          <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
      
    </div>
  );
}