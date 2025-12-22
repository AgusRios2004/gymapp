import { Link } from 'react-router-dom';

export default function Navbar(){
    return (
        <nav className="flex justify-between items-center bg-brand px-12 py-4 text-white font-sans shadow-md">
            <div className="text-2xl font-bold text-white font-serif"> Gimnasio </div>
            <ul className="flex gap-6 list-none m-0 p-0">
                <li><Link to="/" className="text-[#f0f0f0] no-underline font-medium transition-colors duration-300 hover:text-brand-hover">Home</Link></li>
                <li><Link to="/clientes" className="text-[#f0f0f0] no-underline font-medium transition-colors duration-300 hover:text-brand-hover">Clientes</Link></li>
                <li><Link to="/rutinas" className="text-[#f0f0f0] no-underline font-medium transition-colors duration-300 hover:text-brand-hover">Rutinas</Link></li>
                <li><Link to="/pagos" className="text-[#f0f0f0] no-underline font-medium transition-colors duration-300 hover:text-brand-hover">Pagos</Link></li>
                <li><Link to="/login" className="text-[#f0f0f0] no-underline font-medium transition-colors duration-300 hover:text-brand-hover">Login</Link></li>
            </ul>
        </nav>
    )
}