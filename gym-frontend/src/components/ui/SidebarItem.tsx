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
        return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
          active
            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-glow-amber'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-transparent'
        }`;
      }}
    >
      <span className="inline-flex shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );
};