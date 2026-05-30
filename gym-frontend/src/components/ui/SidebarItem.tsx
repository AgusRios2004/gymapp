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
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive || isRelatedActive
            ? 'bg-blue-50 text-green-600 font-medium dark:bg-blue-950/40 dark:text-green-400'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};