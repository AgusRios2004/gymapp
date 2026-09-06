import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ClientesPage from './features/clients/pages/ClientsPage';
import ExercisesPage from './features/routines/pages/ExercisesPage';
import RoutinesPage from './features/routines/pages/RoutinesPage';
import PaymentsPage from './features/payments/pages/PaymentsPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ClientDetailPage from './features/clients/pages/ClientDetailPage';
import AttendancePage from './features/attendance/pages/AttendancePage';
import MonthlyTypesPage from './features/payments/pages/MonthlyTypesPage';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import StaffPage from './features/staff/pages/StaffPage';
import ProductsPage from './features/payments/pages/ProductsPage';
import ClassesPage from './features/attendance/pages/ClassesPage';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import { FeatureProvider, useFeatures } from './context/FeatureContext';

function AppRoutes() {
  const { features } = useFeatures();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} /> 
          <Route path="clients" element={<ClientesPage />} />
          <Route path="clients/:id" element={<ClientDetailPage />} />
          
          {features.payments && (
            <>
              <Route path="payments" element={<PaymentsPage />} /> 
              <Route path="plans" element={<MonthlyTypesPage />} />
              <Route path="products" element={<ProductsPage />} />
            </>
          )}

          {features.routines && (
            <>
              <Route path="exercises" element={<ExercisesPage />} />
              <Route path="routines" element={<RoutinesPage />} />
            </>
          )}

          {features.attendance && (
            <>
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="classes" element={<ClassesPage />} />
            </>
          )}
          
          <Route path="staff" element={<StaffPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <FeatureProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </FeatureProvider>
    </AuthProvider>
  )
}

export default App