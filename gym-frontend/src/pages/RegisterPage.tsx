import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/axios';
import { toast } from 'react-toastify';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowLeft,
  Fingerprint
} from 'lucide-react';
import Button from '../components/ui/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    dni: '',
    phone: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ahora registramos Profesores por defecto
      await api.post('/professors', formData);
      toast.success("✅ ¡Registro exitoso! Ahora puedes iniciar sesión como profesor.");
      navigate('/login');
    } catch (error) {
      toast.error("❌ Error al registrarse. Revisa los datos o consulta al administrador.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-xl w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
        <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 mb-6 hover:translate-x-[-4px] transition-transform">
               <ArrowLeft size={16} /> Volver al Login
            </Link>
            <div className="flex justify-center mb-6">
                <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-lg shadow-indigo-600/30">
                   <UserPlus size={32} />
                </div>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Únete al <span className="text-indigo-600">Staff</span></h2>
            <p className="mt-2 text-gray-500 font-medium">Registra tu perfil de profesor para empezar</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nombre</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="name"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="Ej: Carlos"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Apellido</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="lastName"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="Ej: Gómez"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">DNI</label>
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="dni"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="Sin puntos"
                  value={formData.dni}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="phone"
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="11 2233 4455"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Profesional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="profesor@gym.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg font-bold rounded-2xl shadow-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
            isLoading={isLoading}
          >
            Registrarse como Profesor
          </Button>
        </form>
      </div>
    </div>
  );
}
