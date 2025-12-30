import { Users, CreditCard, LayoutDashboard, Dumbbell, PersonStanding } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import logo from '../../assets/funcional kids.jpeg';

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col fixed left-0 top-4 h-full z-10">
        
        <div className="flex flex-col items-center justify-center h-22 border-b border-gray-200 p-4">
            <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">Functional</span>
            <span className="text-sm font-bold text-blue-600 tracking-widest uppercase">Kids</span>
            <img src={logo} alt="Functional Kids Logo" className="w-12 h-12 mt-2 rounded-full object-cover" />
        </div>

      {/* Menú */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarItem 
          path="/" 
          label="Dashboard" 
          icon={<LayoutDashboard size={20} />} 
          end
        />
        <SidebarItem 
          path="/clients" 
          label="Alumnos" 
          icon={<Users size={20} />} 
        />
        <SidebarItem 
          path="/payments" 
          label="Pagos" 
          icon={<CreditCard size={20} />} 
        />
        <SidebarItem 
          path="/payments" 
          label="Ejercicios" 
          icon={<Dumbbell size={20} />} 
        />
        <SidebarItem 
          path="/rutines" 
          label="Rutinas" 
          icon={<PersonStanding size={20} />} 
        />
      </nav>
      
      {/* Footer del sidebar (opcional) */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">v1.0.0</p>
      </div>
    </aside>
  );
};