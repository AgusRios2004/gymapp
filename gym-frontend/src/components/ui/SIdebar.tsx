import {
  Users,
  CreditCard,
  LayoutDashboard,
  Dumbbell,
  PersonStanding,
  UserCheck,
  Tag,
  LogOut,
  ShieldPlus,
  Palette,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import logo from '../../assets/funcional kids.jpeg';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar = ({ onClose }: SidebarProps) => {
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 h-full flex flex-col z-10 font-sans shadow-sm">
      {/* Header / Logo */}
      <div className="flex flex-col items-center justify-center p-5 border-b border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black font-display text-slate-900 tracking-tight uppercase">
            GYM<span className="text-emerald-600">APP</span>
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">
          Functional Performance
        </span>
        <img
          src={logo}
          alt="Gym Logo"
          className="w-12 h-12 mt-3 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-md shadow-emerald-600/10"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        <SidebarItem
          path="/"
          label="Dashboard"
          icon={<LayoutDashboard size={18} />}
          end
          onClick={onClose}
        />
        <SidebarItem
          path="/clients"
          label="Alumnos"
          icon={<Users size={18} />}
          onClick={onClose}
        />
        {user?.role === 'ADMIN' && (
          <SidebarItem
            path="/staff"
            label="Personal"
            icon={<ShieldPlus size={18} />}
            onClick={onClose}
          />
        )}
        <SidebarItem
          path="/plans"
          label="Planes"
          icon={<Tag size={18} />}
          onClick={onClose}
        />
        <SidebarItem
          path="/payments"
          label="Pagos"
          icon={<CreditCard size={18} />}
          onClick={onClose}
        />
        <SidebarItem
          path="/exercises"
          label="Ejercicios"
          icon={<Dumbbell size={18} />}
          onClick={onClose}
        />
        <SidebarItem
          path="/routines"
          label="Rutinas"
          icon={<PersonStanding size={18} />}
          onClick={onClose}
        />
        <SidebarItem
          path="/attendance"
          label="Asistencia"
          icon={<UserCheck size={18} />}
          onClick={onClose}
        />
        <SidebarItem
          path="/products"
          label="Tienda y Stock"
          icon={<Tag size={18} />}
          onClick={onClose}
        />
        <SidebarItem
          path="/classes"
          label="Clases"
          icon={<LayoutDashboard size={18} />}
          onClick={onClose}
        />
      </nav>

      {/* User & Logout Footer */}
      <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-3 p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm shadow-emerald-600/30">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">
              {user?.name} {user?.lastName}
            </p>
            <p className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">
              {user?.role || 'CLIENT'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 rounded-xl transition-all group"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Cerrar Sesión
        </button>

        <div className="mt-3 pt-3 border-t border-slate-200/60">
          <p className="text-[10px] text-slate-400 text-center font-semibold tracking-wide">
            GYMAPP v1.0.0 • VITALITY GREEN
          </p>
        </div>
      </div>
    </aside>
  );
};