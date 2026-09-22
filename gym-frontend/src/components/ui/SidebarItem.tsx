import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarItemProps {
  path: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
  relatedPaths?: string[];
  onClick?: () => void;
}

export const SidebarItem = ({ path, label, icon, end, relatedPaths, onClick }: SidebarItemProps) => {
  const location = useLocation();
  const isRelatedActive = relatedPaths?.some((p) => location.pathname.startsWith(p));

  return (
    <NavLink
      to={path}
      end={end}
      onClick={onClick}
      className={({ isActive }) => {
        const active = isActive || isRelatedActive;
        return `min-h-11 flex items-center gap-3 px-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
          active
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-sm font-extrabold'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
        }`;
      }}
    >
      <span className="inline-flex shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};