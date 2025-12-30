import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/ui/SIdebar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar Fijo */}
      <Sidebar />

      {/* 2. Contenido Principal */}
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        {/* Aquí es donde React Router inyectará ClientesPage, PagosPage, etc. */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;