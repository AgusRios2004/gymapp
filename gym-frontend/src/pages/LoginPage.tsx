import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Dumbbell, 
  Mail, 
  Lock
} from 'lucide-react';
import Button from '../components/ui/Button';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await apiLogin(email, password);
      login(user);
      toast.success(`👋 ¡Hola de nuevo, ${user.name}!`);
      navigate('/');
    } catch (error) {
      toast.error("❌ Credenciales inválidas. Revisa tu email y contraseña.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100">
        <div className="text-center">
            <div className="inline-flex p-4 bg-blue-500 rounded-3xl text-white mb-6 shadow-lg shadow-blue-500/30">
               <Dumbbell size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Functional <span className="text-blue-600">Kids</span></h2>
            <p className="mt-2 text-gray-500 font-medium">Panel de Gestión Deportiva</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div className="relative">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="admin@gym.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg font-bold rounded-2xl shadow-lg shadow-blue-500/30"
            isLoading={isLoading}
          >
            Iniciar Sesión
          </Button>


        </form>
      </div>
    </div>
  );
}
