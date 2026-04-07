import { Users, CreditCard, LayoutDashboard, Dumbbell, PersonStanding, UserCheck, Tag, LogOut, ShieldPlus } from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import logo from '../../assets/funcional kids.jpeg';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col z-10 font-sans shadow-2xl lg:shadow-none">
        
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
          onClick={onClose}
        />
        <SidebarItem 
          path="/clients" 
          label="Alumnos" 
          icon={<Users size={20} />} 
          onClick={onClose}
        />
        {user?.role === 'ADMIN' && (
          <SidebarItem 
            path="/staff" 
            label="Personal" 
            icon={<ShieldPlus size={20} />} 
            onClick={onClose}
          />
        )}
        <SidebarItem 
          path="/plans" 
          label="Planes" 
          icon={<Tag size={20} />} 
          onClick={onClose}
        />
        <SidebarItem 
          path="/payments" 
          label="Pagos" 
          icon={<CreditCard size={20} />} 
          onClick={onClose}
        />

        <SidebarItem 
          path="/exercises" 
          label="Ejercicios" 
          icon={<Dumbbell size={20} />} 
          onClick={onClose}
        />
        <SidebarItem 
          path="/routines" 
          label="Rutinas" 
          icon={<PersonStanding size={20} />} 
          onClick={onClose}
        />
        <SidebarItem 
          path="/attendance" 
          label="Asistencia" 
          icon={<UserCheck size={20} />} 
          onClick={onClose}
        />
        <SidebarItem 
          path="/products" 
          label="Tienda y Stock" 
          icon={<Tag size={20} />} 
          onClick={onClose}
        />
        <SidebarItem 
          path="/classes" 
          label="Clases" 
          icon={<LayoutDashboard size={20} />} 
          onClick={onClose}
        />
      </nav>
      
      {/* Footer del sidebar */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-200">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{user?.name} {user?.lastName}</p>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Cerrar Sesión
        </button>
        
        <div className="mt-4 pt-4 border-t border-gray-100/50">
           <p className="text-[10px] text-gray-300 text-center font-medium">Functional Kids v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};