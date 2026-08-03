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
    <aside className="w-64 bg-zinc-950 border-r border-zinc-800/80 h-full flex flex-col z-10 font-sans shadow-industrial">
      {/* Header / Logo */}
      <div className="flex flex-col items-center justify-center p-5 border-b border-zinc-800/80 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black font-display text-white tracking-tight uppercase">
            GYM<span className="text-amber-500">APP</span>
          </span>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase mt-0.5">
          Functional Performance
        </span>
        <img
          src={logo}
          alt="Gym Logo"
          className="w-12 h-12 mt-3 rounded-xl object-cover ring-2 ring-amber-500/30 shadow-glow-amber"
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
        <SidebarItem
          path="/design-system"
          label="Design System"
          icon={<Palette size={18} />}
          onClick={onClose}
        />
      </nav>

      {/* User & Logout Footer */}
      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/60">
        <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-zinc-800/50 border border-zinc-700/40">
          <div className="w-9 h-9 rounded-lg bg-amber-500 text-zinc-950 flex items-center justify-center font-extrabold text-sm shadow-glow-amber">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">
              {user?.name} {user?.lastName}
            </p>
            <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-wider">
              {user?.role || 'CLIENT'}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/80 border border-rose-900/50 rounded-xl transition-all group"
        >
          <LogOut size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Cerrar Sesión
        </button>

        <div className="mt-3 pt-3 border-t border-zinc-800/50">
          <p className="text-[10px] text-zinc-500 text-center font-semibold tracking-wide">
            GYMAPP v1.0.0 • INDUSTRIAL UI
          </p>
        </div>
      </div>
    </aside>
  );
};