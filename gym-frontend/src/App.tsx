import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'

//Mockeado
const ClientesPage = () => <h1 className="text-2xl font-bold">Gestión de Clientes</h1>;
const PagosPage = () => <h1 className="text-2xl font-bold">Gestión de Pagos</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'>
          <Route index element={<MainLayout />} />
          <Route path='/clientes' element={<ClientesPage />} />
          <Route path='/pagos' element={<PagosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
