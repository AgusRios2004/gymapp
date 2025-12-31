import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ClientesPage from './pages/ClientsPage';
import ExercisesPage from './pages/ExercisesPage';
import RoutinesPage from './pages/RoutinesPage';

const DashboardPage = () => <h1 className="text-2xl font-bold">Dashboard Principal</h1>;
const PagosPage = () => <h1 className="text-2xl font-bold">Gestión de Pagos</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} /> 
          <Route path="clients" element={<ClientesPage />} />
          <Route path="payments" element={<PagosPage />} /> 
          <Route path="exercises" element={<ExercisesPage />} />
          <Route path="routines" element={<RoutinesPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App