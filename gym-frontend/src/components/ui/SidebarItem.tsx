import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarItemProps {
  path: string;
  label: string;
  icon: ReactNode;
}

export const SidebarItem = ({ path, label, icon }: SidebarItemProps) => {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-blue-50 text-green-600 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
};