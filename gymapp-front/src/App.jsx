import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
//Pages
import HomePage from './pages/HomePage/HomePage'
import LoginPage from './pages/LoginPage/LoginPage'
import ClientPage from './pages/ClientsPage/ClientPage'
import RutinePage from './pages/RutinesPage/RutinePage'
import PaymentPage from './pages/PaymentsPage/PaymentPage'
import ClientDetails from './pages/ClientDetails/ClientDetails'

//Components
import Navbar from './components/Navbar/Navbar'
import './App.css'
function App() {

    const [user, setUser] = useState(null)

    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/clientes" element={<ClientPage />} />
                <Route path='/clients/:id' element={<ClientDetails/>} />
                <Route path="/rutinas" element={<RutinePage />} />
                <Route path="/pagos" element={<PaymentPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
