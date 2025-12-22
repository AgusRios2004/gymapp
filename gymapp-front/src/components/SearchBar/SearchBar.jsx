import { Search } from 'lucide-react'; // Asegúrate de tener instalado `lucide-react` o usa un ícono alternativo

export default function SearchBar({ value, onChange }) {
    return (
        <div className="flex items-center bg-surface rounded-lg px-4 py-2 w-full max-w-[350px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-300 focus-within:shadow-[0_0_0_2px_rgba(0,123,255,0.2)]">
            <Search className="w-5 h-5 text-[#888] mr-2" />
            <input
                type="text"
                placeholder="Buscar cliente..."
                value={value}
                onChange={onChange}
                className="flex-1 outline-none bg-transparent text-base text-[#333] placeholder-gray-400 border-none"
            />
        </div>
    );
}
