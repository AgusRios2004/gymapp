import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ClientesPage from './pages/ClientsPage';
import ExercisesPage from './pages/ExercisesPage';
import RoutinesPage from './pages/RoutinesPage';
import PaymentsPage from './pages/PaymentsPage';
import DashboardPage from './pages/DashboardPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AttendancePage from './pages/AttendancePage';
import MonthlyTypesPage from './pages/MonthlyTypesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffPage from './pages/StaffPage';
import ProductsPage from './pages/ProductsPage';
import ClassesPage from './pages/ClassesPage';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<DashboardPage />} /> 
              <Route path="clients" element={<ClientesPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="payments" element={<PaymentsPage />} /> 
              <Route path="exercises" element={<ExercisesPage />} />
              <Route path="routines" element={<RoutinesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="plans" element={<MonthlyTypesPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="classes" element={<ClassesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App